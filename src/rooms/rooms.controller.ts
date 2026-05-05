import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import type { Room } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CurrentRoom } from '../common/decorators/current-room.decorator';
import { RoomGuard } from '../common/guards/room.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: JwtPayload) {
    return this.roomsService.create(dto, user.sub);
  }

  @Get(':slug')
  @UseGuards(RoomGuard)
  findOne(@CurrentRoom() room: Room) {
    return this.roomsService.findOne(room);
  }

  @Patch(':slug')
  @UseGuards(RoomGuard)
  update(@CurrentRoom() room: Room, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(room, dto);
  }

  @Post(':slug/archive')
  @UseGuards(RoomGuard)
  archive(@CurrentRoom() room: Room) {
    return this.roomsService.archive(room);
  }
}
