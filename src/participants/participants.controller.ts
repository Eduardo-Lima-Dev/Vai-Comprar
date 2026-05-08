import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { Room } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CurrentRoom } from '../common/decorators/current-room.decorator';
import { RoomGuard } from '../common/guards/room.guard';
import { JoinParticipantDto } from './dto/join-participant.dto';
import { ParticipantsService } from './participants.service';

@Controller('rooms/:slug/participants')
@UseGuards(JwtAuthGuard, RoomGuard)
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  join(
    @CurrentRoom() room: Room,
    @Body() dto: JoinParticipantDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.participantsService.join(room, dto, user.sub);
  }

  @Delete(':participantId')
  remove(
    @CurrentRoom() room: Room,
    @Param('participantId') participantId: string,
  ) {
    return this.participantsService.remove(room, participantId);
  }
}
