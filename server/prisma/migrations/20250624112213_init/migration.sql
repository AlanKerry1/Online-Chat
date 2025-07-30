-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelChat" (
    "id" SERIAL NOT NULL,
    "channelName" TEXT NOT NULL,

    CONSTRAINT "ChannelChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectChat" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "DirectChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersDirectChats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "UsersDirectChats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersChannelChats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "UsersChannelChats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelChatId" INTEGER,
    "directChatId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelChat_channelName_key" ON "ChannelChat"("channelName");

-- AddForeignKey
ALTER TABLE "UsersDirectChats" ADD CONSTRAINT "UsersDirectChats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersDirectChats" ADD CONSTRAINT "UsersDirectChats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "DirectChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersChannelChats" ADD CONSTRAINT "UsersChannelChats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersChannelChats" ADD CONSTRAINT "UsersChannelChats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ChannelChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelChatId_fkey" FOREIGN KEY ("channelChatId") REFERENCES "ChannelChat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_directChatId_fkey" FOREIGN KEY ("directChatId") REFERENCES "DirectChat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
