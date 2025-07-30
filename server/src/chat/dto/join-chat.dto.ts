export class JoinChatDto {
    readonly name: string;

    readonly forName: string
    readonly channelName: string;

    readonly message?: {
        text: string;
        from: string;
        to: string;
        room: string;
        channel: boolean;
    }
}