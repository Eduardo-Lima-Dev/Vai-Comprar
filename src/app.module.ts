import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { ParticipantsModule } from './participants/participants.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { RoomsModule } from './rooms/rooms.module';
import { ShoppingModule } from './shopping/shopping.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RealtimeModule,
    HealthModule,
    RoomsModule,
    ItemsModule,
    ParticipantsModule,
    ShoppingModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
