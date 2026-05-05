import { ForbiddenException } from '@nestjs/common';
import type { Room } from '@prisma/client';

export function assertRoomWritable(room: Room): void {
  if (room.archivedAt) {
    throw new ForbiddenException('Esta sala está arquivada.');
  }
}
