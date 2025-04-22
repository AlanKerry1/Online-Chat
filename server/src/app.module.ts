import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { PrismaService } from 'prisma/prisma.service';
import { APP_FILTER } from '@nestjs/core';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Module({
  imports: [ChatModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BaseWsExceptionFilter,
    },
  ]
})
export class AppModule {}
