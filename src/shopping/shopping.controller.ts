import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { Room } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentRoom } from '../common/decorators/current-room.decorator';
import { RoomGuard } from '../common/guards/room.guard';
import { FinishShoppingDto } from './dto/finish-shopping.dto';
import { StartShoppingDto } from './dto/start-shopping.dto';
import { ShoppingService } from './shopping.service';

@Controller('rooms/:slug')
@UseGuards(JwtAuthGuard, RoomGuard)
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get('shopping/active')
  getActive(@CurrentRoom() room: Room) {
    return this.shoppingService.getActive(room);
  }

  @Post('shopping/start')
  start(@CurrentRoom() room: Room, @Body() dto: StartShoppingDto) {
    return this.shoppingService.start(room, dto);
  }

  @Post('shopping/:sessionId/finish')
  finish(
    @CurrentRoom() room: Room,
    @Param('sessionId') sessionId: string,
    @Body() dto: FinishShoppingDto,
  ) {
    return this.shoppingService.finish(room, sessionId, dto);
  }

  @Delete('shopping/:sessionId')
  cancel(
    @CurrentRoom() room: Room,
    @Param('sessionId') sessionId: string,
  ) {
    return this.shoppingService.cancel(room, sessionId);
  }

  @Get('purchases')
  listPurchases(@CurrentRoom() room: Room) {
    return this.shoppingService.listPurchases(room);
  }

  @Get('purchases/:purchaseId')
  getPurchase(
    @CurrentRoom() room: Room,
    @Param('purchaseId') purchaseId: string,
  ) {
    return this.shoppingService.getPurchase(room, purchaseId);
  }
}
