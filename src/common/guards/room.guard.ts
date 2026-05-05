import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Room } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROOM_REQUEST_KEY } from '../constants';

type RequestWithSlug = { params: { slug?: string } } & Record<
  typeof ROOM_REQUEST_KEY,
  Room | undefined
>;

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithSlug>();
    const slug = req.params?.slug;
    if (!slug) {
      throw new NotFoundException('Sala não encontrada');
    }

    const room = await this.prisma.room.findUnique({ where: { slug } });
    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    req[ROOM_REQUEST_KEY] = room;
    return true;
  }
}
