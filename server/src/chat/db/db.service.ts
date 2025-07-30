import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { JoinChatDto } from '../dto/join-chat.dto';
import { GetChatsDto } from '../dto/get-chats.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { connect } from 'http2';
import { GetMessagesDto } from '../dto/get-messages.dto';

@Injectable()
export class DBService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const candidate = await this.prisma.user.findFirst({
      where: {
        name: registerDto.name,
      },
    });

    const channel = await this.prisma.channelChat.findFirst({
      where: {
        channelName: registerDto.name,
      },
    });

    if (!candidate && !channel) {
      return await this.prisma.user.create({
        data: { name: registerDto.name },
      });
    }
  }

  async addDirectChat(joinChatDto: JoinChatDto, message?: SendMessageDto) {
    const user = await this.prisma.user.findFirst({
      where: { name: joinChatDto.name },
    });
    const forUser = await this.prisma.user.findFirst({
      where: { name: joinChatDto.forName },
    });

    const chatAlreadyCreated = await this.prisma.directChat.findFirst({
      where: {
        users: {
          some: {
            userId: user?.id,
          },
        },
        AND: {
          users: {
            some: {
              userId: forUser?.id,
            },
          },
        },
      },
    });

    if (chatAlreadyCreated) return;
    if (!forUser) return;

    const newChat = await this.prisma.directChat.create({
      data: {
        users: {
          create: [
            {
              user: {
                connect: { id: Number(user?.id) },
              },
            },
            {
              user: {
                connect: { id: Number(forUser?.id) },
              },
            },
          ],
        },
      },
    });

    if (message) await this.sendMessage(message);

    return newChat;
  }

  async addUserToChannel(joinChatDto: JoinChatDto, message?: SendMessageDto) {
    const user = await this.prisma.user.findFirst({
      where: { name: joinChatDto.name },
    });

    const userInChannel = await this.prisma.user.findFirst({
      where: {
        name: user?.name,
        channelChats: {
          some: {
            chat: {
              channelName: joinChatDto.channelName,
            },
          },
        },
      },
    });

    if (userInChannel) return;

    const channel = await this.prisma.channelChat.findFirst({
      where: { channelName: joinChatDto.channelName },
    });

    if (channel) {
      return await this.prisma.channelChat.update({
        where: { channelName: joinChatDto.channelName },
        data: {
          users: {
            create: [
              {
                user: {
                  connect: { id: Number(user?.id) },
                },
              },
            ],
          },
        },
      });
    }

    const candidate = await this.prisma.user.findFirst({
      where: {
        name: joinChatDto.channelName,
      },
    });

    if (candidate) return;

    const newChannel = await this.prisma.channelChat.create({
      data: {
        channelName: joinChatDto.channelName,
        users: {
          create: [
            {
              user: {
                connect: { id: Number(user?.id) },
              },
            },
          ],
        },
      },
    });

    if (message) await this.sendMessage(message);

    return newChannel;
  }

  async getChats(getChatsDto: GetChatsDto) {
    const chats = {};

    const channels = await this.prisma.channelChat.findMany({
      where: {
        users: {
          some: {
            user: {
              name: getChatsDto.name,
            },
          },
        },
      },
    });

    const directs = await this.prisma.directChat.findMany({
      where: {
        users: {
          some: {
            user: {
              name: getChatsDto.name,
            },
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    return { channels, directs };
  }

  async sendMessage(sendMessageDto: SendMessageDto) {
    const res = await this.prisma.user.update({
      where: { name: sendMessageDto.from },
      data: {
        messages: {
          create: [{ text: sendMessageDto.text }],
        },
      },
      include: {
        messages: true,
      },
    });
    const message = res.messages.at(-1);

    if (sendMessageDto.channel) {
      return await this.prisma.channelChat.update({
        where: {
          channelName: sendMessageDto.to,
        },
        data: {
          messages: {
            connect: {
              id: message?.id,
            },
          },
        },
      });
    } else {
      const direct = await this.prisma.directChat.findFirst({
        where: {
          users: {
            some: {
              user: { name: sendMessageDto.to },
            },
          },
          AND: {
            users: {
              some: {
                user: { name: sendMessageDto.from },
              },
            },
          },
        },
      });

      if (!direct) return;

      return await this.prisma.directChat.update({
        where: {
          id: direct?.id,
        },
        data: {
          messages: {
            connect: {
              id: message?.id,
            },
          },
        },
      });
    }
  }

  async getMessages(getMessagesDto: GetMessagesDto) {
    if (getMessagesDto.channelName) {
      const res = await this.prisma.channelChat.findFirst({
        where: {
          channelName: getMessagesDto.channelName,
        },
        include: {
          messages: {
            include: {
              user: true,
            },
          },
        },
      });
      return res?.messages;
    } else {
      const res = await this.prisma.directChat.findFirst({
        where: {
          users: {
            every: {
              user: {
                name: {
                  in: [getMessagesDto.to, getMessagesDto.from],
                },
              },
            },
          },
        },
        include: {
          messages: {
            include: {
              user: true,
            },
          },
        },
      });
      return res?.messages;
    }
  }
}
