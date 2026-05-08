import { Injectable, ForbiddenException } from '@nestjs/common';
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

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await this.prisma.participant.create({
        data: {
          roomId: room.id,
          userId,
          name: user.name,
        },
      });
    }

    this.gateway.emitToRoom(slug, 'room:created', { room });
    return room;
  }

  async findAllForUser(userId: string) {
    const rooms = await this.prisma.room.findMany({
      where: {
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        accesses: {
          where: { userId },
          select: { lastAccessedAt: true },
        },
      },
    });

    return rooms
      .map(room => {
        const accessTime =
          room.accesses[0]?.lastAccessedAt?.getTime() || room.createdAt.getTime();
        const { accesses, ...rest } = room;
        return { ...rest, _sortTime: accessTime };
      })
      .sort((a, b) => {
        // Unarchived first
        const isArchivedA = a.archivedAt ? 1 : 0;
        const isArchivedB = b.archivedAt ? 1 : 0;
        if (isArchivedA !== isArchivedB) {
          return isArchivedA - isArchivedB;
        }

        // Then by personal access time descending
        return b._sortTime - a._sortTime;
      })
      .map(({ _sortTime, ...room }) => room);
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

  async touch(room: Room, userId: string) {
    const now = new Date();
    
    const updated = await this.prisma.room.update({
      where: { id: room.id },
      data: { lastAccessedAt: now },
    });

    await this.prisma.roomAccess.upsert({
      where: {
        userId_roomId: {
          userId,
          roomId: room.id,
        },
      },
      create: {
        userId,
        roomId: room.id,
        lastAccessedAt: now,
      },
      update: {
        lastAccessedAt: now,
      },
    });

    const existingParticipant = await this.prisma.participant.findFirst({
      where: { roomId: room.id, userId },
    });

    if (!existingParticipant) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        await this.prisma.participant.create({
          data: {
            roomId: room.id,
            userId,
            name: user.name,
          },
        });
      }
    }

    return updated;
  }

  async remove(room: Room, userId: string) {
    if (room.createdById !== userId) {
      throw new ForbiddenException('Somente o criador pode apagar a sala');
    }
    await this.prisma.room.delete({
      where: { id: room.id },
    });
    this.gateway.emitToRoom(room.slug, 'room:deleted', { roomId: room.id });
    return { id: room.id, deleted: true };
  }

  async leave(room: Room, userId: string) {
    if (room.createdById === userId) {
      throw new ForbiddenException(
        'O criador não pode sair da sala. Apague a sala em vez disso.',
      );
    }

    await this.prisma.roomAccess.deleteMany({
      where: { roomId: room.id, userId },
    });

    const participant = await this.prisma.participant.findFirst({
      where: { roomId: room.id, userId },
    });

    if (participant) {
      await this.prisma.participant.update({
        where: { id: participant.id },
        data: { userId: null },
      });
      this.gateway.emitToRoom(room.slug, 'participant:left', {
        participantId: participant.id,
      });
    }

    return { success: true };
  }
}
