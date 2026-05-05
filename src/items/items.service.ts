import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemStatus, type Room } from '@prisma/client';
import { assertRoomWritable } from '../common/utils/room-access';
import { groupItemsByCategory } from '../common/utils/items-grouped';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsGateway } from '../realtime/rooms.gateway';
import type { CreateItemDto } from './dto/create-item.dto';
import type { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RoomsGateway,
  ) {}

  async findAllGrouped(room: Room) {
    const items = await this.prisma.item.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: 'asc' },
    });

    const pending = items.filter((i) => i.status === ItemStatus.PENDING);
    const purchased = items.filter((i) => i.status === ItemStatus.PURCHASED);

    return {
      pending: groupItemsByCategory(pending),
      purchased: groupItemsByCategory(purchased),
    };
  }

  async create(room: Room, dto: CreateItemDto) {
    assertRoomWritable(room);
    const item = await this.prisma.item.create({
      data: {
        roomId: room.id,
        name: dto.name,
        quantity: dto.quantity,
        category: dto.category,
      },
    });
    this.gateway.emitToRoom(room.slug, 'item:created', { item });
    return item;
  }

  async update(room: Room, itemId: string, dto: UpdateItemDto) {
    assertRoomWritable(room);
    const existing = await this.prisma.item.findFirst({
      where: { id: itemId, roomId: room.id },
    });
    if (!existing) {
      throw new NotFoundException('Item não encontrado');
    }

    const item = await this.prisma.item.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
    this.gateway.emitToRoom(room.slug, 'item:updated', { item });
    return item;
  }

  async remove(room: Room, itemId: string) {
    assertRoomWritable(room);
    const existing = await this.prisma.item.findFirst({
      where: { id: itemId, roomId: room.id },
    });
    if (!existing) {
      throw new NotFoundException('Item não encontrado');
    }

    await this.prisma.item.delete({ where: { id: itemId } });
    this.gateway.emitToRoom(room.slug, 'item:deleted', { itemId });
    return { id: itemId, deleted: true };
  }
}
