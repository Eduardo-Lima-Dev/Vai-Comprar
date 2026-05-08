import { Body, Controller, Get, Patch, Post, Delete, UseGuards } from '@nestjs/common';
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

  @Get()
  findAllForUser(@CurrentUser() user: JwtPayload) {
    return this.roomsService.findAllForUser(user.sub);
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

  @Post(':slug/touch')
  @UseGuards(RoomGuard)
  touch(@CurrentRoom() room: Room, @CurrentUser() user: JwtPayload) {
    return this.roomsService.touch(room, user.sub);
  }

  @Delete(':slug')
  @UseGuards(RoomGuard)
  remove(@CurrentRoom() room: Room, @CurrentUser() user: JwtPayload) {
    return this.roomsService.remove(room, user.sub);
  }

  @Delete(':slug/leave')
  @UseGuards(RoomGuard)
  leave(@CurrentRoom() room: Room, @CurrentUser() user: JwtPayload) {
    return this.roomsService.leave(room, user.sub);
  }
}
