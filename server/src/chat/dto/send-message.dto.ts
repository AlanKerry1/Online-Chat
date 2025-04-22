export class SendMessageDto {
    readonly text: string;
    readonly from: string;
    readonly to: string;
    readonly room: string;
    readonly channel: boolean;
}