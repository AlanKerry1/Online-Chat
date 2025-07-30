import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { PrismaService } from "prisma/prisma.service";
import { Server, Socket } from "socket.io";
import { DBService } from "./db/db.service";
import { RegisterDto } from "./dto/register.dto";
import { JoinChatDto } from "./dto/join-chat.dto";
import { GetChatsDto } from "./dto/get-chats.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { GetMessagesDto } from "./dto/get-messages.dto";
import { channel } from "diagnostics_channel";

@WebSocketGateway({cors: {origin: "*"}})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly db: DBService) {}

    @SubscribeMessage("newMessage")
    handleMessage(client: Socket, sendMessageDto: SendMessageDto) {
        client.broadcast.to(sendMessageDto.room).emit("message", {text: sendMessageDto.text, from: sendMessageDto.from, channel: sendMessageDto.channel, channelName: sendMessageDto.channel ? sendMessageDto.to : null});
        client.broadcast.to(sendMessageDto.from).emit("myMessage", {text: sendMessageDto.text, from: sendMessageDto.to})
        this.db.sendMessage(sendMessageDto);
    }

    @SubscribeMessage("joinRoom")
    joinRoom(client: Socket, message: {room: string}) {
        client.join(message.room);
    }
    
    @SubscribeMessage("joinChat")
    joinChat(client: Socket, joinChatDto: JoinChatDto) {
        const message = joinChatDto.message;
        if (joinChatDto.channelName) {
            this.db.addUserToChannel(joinChatDto, message);
            if (message) {
                client.broadcast.to(message.room).emit("message", {text: message.text, from: message.from, channel: message.channel, channelName: message.channel ? message.to : null});
                client.broadcast.to(message.from).emit("myMessage", {text: message.text, from: message.to})
            }
        } else {
            this.db.addDirectChat(joinChatDto, message);
            if (message) {
                client.broadcast.to(message.room).emit("message", {text: message.text, from: message.from, channel: message.channel, channelName: message.channel ? message.to : null});
                client.broadcast.to(message.from).emit("myMessage", {text: message.text, from: message.to})
            }
        }
    }

    @SubscribeMessage("register")
    register(client: Socket, registerDto: RegisterDto) {
        this.db.register(registerDto);
    }

    @SubscribeMessage("getChats")
    async getChats(client: Socket, getChatsDto: GetChatsDto) {
        const chats = await this.db.getChats(getChatsDto);
        this.server.to(getChatsDto.name).emit("chats", chats);
    }

    @SubscribeMessage("getMessages")
    async getMessages(client: Socket, getMessagesDto: GetMessagesDto) {
        const messages = await this.db.getMessages(getMessagesDto);
        this.server.to(getMessagesDto.from).emit("messages", messages);
    }

    handleConnection(client: Socket) {
        client.broadcast.emit("user-joined", {
            message: `New user joined the chat: ${client.id}`,
        });
    }

    handleDisconnect(client: any) {
        this.server.emit("user-left", {
            message: `User left the chat: ${client.id}`,
        });
    }
} 