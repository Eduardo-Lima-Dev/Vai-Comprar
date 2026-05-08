import { Injectable, NotFoundException } from '@nestjs/common';
import type { Room } from '@prisma/client';
import { assertRoomWritable } from '../common/utils/room-access';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsGateway } from '../realtime/rooms.gateway';
import type { JoinParticipantDto } from './dto/join-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RoomsGateway,
  ) {}

  async findAll(room: Room) {
    const members: Array<{
      id: string;
      userId: string | null;
      name: string;
      role: 'CREATOR' | 'PARTICIPANT';
      joinedAt: Date;
    }> = [];

    if (room.createdById) {
      const creator = await this.prisma.user.findUnique({
        where: { id: room.createdById },
        select: { id: true, name: true, createdAt: true },
      });
      if (creator) {
        members.push({
          id: creator.id,
          userId: creator.id,
          name: creator.name,
          role: 'CREATOR',
          joinedAt: room.createdAt,
        });
      }
    }

    const participants = await this.prisma.participant.findMany({
      where: { roomId: room.id },
      orderBy: { joinedAt: 'asc' },
    });

    for (const p of participants) {
      members.push({
        id: p.id,
        userId: p.userId,
        name: p.name,
        role: 'PARTICIPANT',
        joinedAt: p.joinedAt,
      });
    }

    return members;
  }

  async join(room: Room, dto: JoinParticipantDto, userId: string) {
    assertRoomWritable(room);
    const participant = await this.prisma.participant.create({
      data: {
        roomId: room.id,
        userId,
        name: dto.name,
      },
    });
    this.gateway.emitToRoom(room.slug, 'participant:joined', { participant });
    return participant;
  }

  async remove(room: Room, participantId: string) {
    assertRoomWritable(room);
    const existing = await this.prisma.participant.findFirst({
      where: { id: participantId, roomId: room.id },
    });
    if (!existing) {
      throw new NotFoundException('Participante não encontrado');
    }

    await this.prisma.participant.delete({ where: { id: participantId } });
    this.gateway.emitToRoom(room.slug, 'participant:left', { participantId });
    return { id: participantId, deleted: true };
  }
}
