import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ItemStatus,
  ShoppingStatus,
  type Purchase,
  type PurchaseItem,
  type Room,
} from '@prisma/client';
import { assertRoomWritable } from '../common/utils/room-access';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsGateway } from '../realtime/rooms.gateway';
import type { FinishShoppingDto } from './dto/finish-shopping.dto';
import type { StartShoppingDto } from './dto/start-shopping.dto';

type PurchaseWithItems = Purchase & { items: PurchaseItem[] };

@Injectable()
export class ShoppingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RoomsGateway,
  ) {}

  private serializePurchase(purchase: PurchaseWithItems) {
    return {
      ...purchase,
      totalAmount: Number(purchase.totalAmount),
    };
  }

  private async ensureParticipantInRoom(
    roomId: string,
    participantId: string | undefined,
  ): Promise<void> {
    if (!participantId) return;
    const p = await this.prisma.participant.findFirst({
      where: { id: participantId, roomId },
    });
    if (!p) {
      throw new NotFoundException('Participante não encontrado nesta sala');
    }
  }

  async getActive(room: Room) {
    const active = await this.prisma.shoppingSession.findFirst({
      where: {
        roomId: room.id,
        status: ShoppingStatus.IN_PROGRESS,
      },
      include: {
        participant: { select: { name: true } },
      },
    });

    if (!active) {
      return null;
    }

    return {
      id: active.id,
      startedAt: active.startedAt,
      participantId: active.participantId,
      participantName: active.participant?.name ?? null,
    };
  }

  async start(room: Room, dto: StartShoppingDto) {
    assertRoomWritable(room);
    await this.ensureParticipantInRoom(room.id, dto.participantId);

    const active = await this.prisma.shoppingSession.findFirst({
      where: {
        roomId: room.id,
        status: ShoppingStatus.IN_PROGRESS,
      },
    });
    if (active) {
      throw new ConflictException(
        'Já existe uma compra em andamento nesta sala',
      );
    }

    const session = await this.prisma.shoppingSession.create({
      data: {
        roomId: room.id,
        participantId: dto.participantId,
        status: ShoppingStatus.IN_PROGRESS,
      },
    });

    this.gateway.emitToRoom(room.slug, 'shopping:started', { session });
    return session;
  }

  async finish(room: Room, sessionId: string, dto: FinishShoppingDto) {
    assertRoomWritable(room);
    await this.ensureParticipantInRoom(room.id, dto.participantId);

    const session = await this.prisma.shoppingSession.findFirst({
      where: { id: sessionId, roomId: room.id },
    });
    if (!session) {
      throw new NotFoundException('Sessão de compra não encontrada');
    }
    if (session.status !== ShoppingStatus.IN_PROGRESS) {
      throw new ConflictException('Esta sessão de compra já foi finalizada');
    }

    const participantIdForPurchase =
      dto.participantId ?? session.participantId ?? undefined;

    if (participantIdForPurchase) {
      await this.ensureParticipantInRoom(room.id, participantIdForPurchase);
    }

    const purchase = await this.prisma.$transaction(async (tx) => {
      const items = await tx.item.findMany({
        where: { roomId: room.id },
        orderBy: { createdAt: 'asc' },
      });

      const created = await tx.purchase.create({
        data: {
          roomId: room.id,
          sessionId: session.id,
          participantId: participantIdForPurchase,
          totalAmount: dto.totalAmount,
          items: {
            create: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              category: item.category,
              wasPurchased: item.status === ItemStatus.PURCHASED,
            })),
          },
        },
        include: { items: true },
      });

      await tx.item.updateMany({
        where: { roomId: room.id, status: ItemStatus.PURCHASED },
        data: { status: ItemStatus.PENDING },
      });

      await tx.shoppingSession.update({
        where: { id: session.id },
        data: {
          status: ShoppingStatus.FINISHED,
          finishedAt: new Date(),
        },
      });

      return created;
    });

    this.gateway.emitToRoom(room.slug, 'shopping:finished', {
      purchase: this.serializePurchase(purchase),
    });

    return this.serializePurchase(purchase);
  }

  async cancel(room: Room, sessionId: string) {
    assertRoomWritable(room);

    const session = await this.prisma.shoppingSession.findFirst({
      where: { id: sessionId, roomId: room.id },
    });
    
    if (!session) {
      throw new NotFoundException('Sessão de compra não encontrada');
    }
    if (session.status !== ShoppingStatus.IN_PROGRESS) {
      throw new ConflictException('Apenas sessões em andamento podem ser canceladas');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Reset all purchased items back to pending
      await tx.item.updateMany({
        where: { roomId: room.id, status: ItemStatus.PURCHASED },
        data: { status: ItemStatus.PENDING },
      });

      // 2. Delete the session
      await tx.shoppingSession.delete({
        where: { id: session.id },
      });
    });

    this.gateway.emitToRoom(room.slug, 'shopping:cancelled', { sessionId });
    return { success: true };
  }

  async listPurchases(room: Room) {
    const list = await this.prisma.purchase.findMany({
      where: { roomId: room.id },
      orderBy: { purchasedAt: 'desc' },
      include: {
        items: true,
        participant: { select: { id: true, name: true } },
      },
    });
    return list.map((p) => this.serializePurchase(p));
  }

  async getPurchase(room: Room, purchaseId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id: purchaseId, roomId: room.id },
      include: {
        items: true,
        participant: { select: { id: true, name: true } },
      },
    });
    if (!purchase) {
      throw new NotFoundException('Compra não encontrada');
    }
    return this.serializePurchase(purchase);
  }
}
