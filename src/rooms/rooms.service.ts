import { Injectable } from '@nestjs/common';
import type { Room } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { assertRoomWritable } from '../common/utils/room-access';
import { RoomsGateway } from '../realtime/rooms.gateway';
import type { CreateRoomDto } from './dto/create-room.dto';
import type { UpdateRoomDto } from './dto/update-room.dto';

const SLUG_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomSlug(length = 12): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RoomsGateway,
  ) {}

  async create(dto: CreateRoomDto, userId: string): Promise<Room> {
    let slug = randomSlug();
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.room.findUnique({ where: { slug } });
      if (!exists) break;
      slug = randomSlug();
    }

    const room = await this.prisma.room.create({
      data: {
        slug,
        name: dto.name,
        createdById: userId,
        plannedDate: dto.plannedDate ?? undefined,
      },
    });

    this.gateway.emitToRoom(slug, 'room:created', { room });
    return room;
  }

  async findAllForUser(userId: string) {
    return this.prisma.room.findMany({
      where: {
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } },
        ],
      },
      orderBy: [
        { archivedAt: { sort: 'asc', nulls: 'first' } },
        { lastAccessedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(room: Room) {
    return this.prisma.room.findUnique({
      where: { id: room.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true, participants: true } },
      },
    });
  }

  async update(room: Room, dto: UpdateRoomDto) {
    assertRoomWritable(room);
    const updated = await this.prisma.room.update({
      where: { id: room.id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.plannedDate !== undefined && { plannedDate: dto.plannedDate }),
      },
    });
    this.gateway.emitToRoom(room.slug, 'room:updated', { room: updated });
    return updated;
  }

  async archive(room: Room) {
    assertRoomWritable(room);
    const updated = await this.prisma.room.update({
      where: { id: room.id },
      data: { archivedAt: new Date() },
    });
    this.gateway.emitToRoom(room.slug, 'room:archived', { room: updated });
    return updated;
  }

  async touch(room: Room) {
    const updated = await this.prisma.room.update({
      where: { id: room.id },
      data: { lastAccessedAt: new Date() },
    });
    return updated;
  }
}
