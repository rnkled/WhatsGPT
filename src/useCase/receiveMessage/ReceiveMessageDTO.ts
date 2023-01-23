import { Message, Whatsapp } from "venom-bot";

export interface IReceiveMessageDTO {
    message: Message;
    client: Whatsapp;
};