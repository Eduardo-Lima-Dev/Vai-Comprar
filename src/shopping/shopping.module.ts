import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';

@Module({
  imports: [RealtimeModule],
  controllers: [ShoppingController],
  providers: [ShoppingService],
})
export class ShoppingModule {}
