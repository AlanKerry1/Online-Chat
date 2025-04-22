import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { PrismaService } from 'prisma/prisma.service';
import { DBService } from './db/db.service';

@Module({
    providers: [ChatGateway, PrismaService, DBService]
})
export class ChatModule {}
