import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [RealtimeModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
