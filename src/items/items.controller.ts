import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { Room } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentRoom } from '../common/decorators/current-room.decorator';
import { RoomGuard } from '../common/guards/room.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('rooms/:slug/items')
@UseGuards(JwtAuthGuard, RoomGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@CurrentRoom() room: Room) {
    return this.itemsService.findAllGrouped(room);
  }

  @Post()
  create(@CurrentRoom() room: Room, @Body() dto: CreateItemDto) {
    return this.itemsService.create(room, dto);
  }

  @Patch(':itemId')
  update(
    @CurrentRoom() room: Room,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.update(room, itemId, dto);
  }

  @Delete(':itemId')
  remove(@CurrentRoom() room: Room, @Param('itemId') itemId: string) {
    return this.itemsService.remove(room, itemId);
  }
}
