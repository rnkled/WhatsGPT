import { IMessage, ISenderProvider } from './../ISenderProvider';
import { create, Whatsapp, Message, SocketState } from 'venom-bot';
import fs from 'fs';
import mime from 'mime-types';
import { ReceiveMessage } from '../../useCase/receiveMessage/ReceiveMessageUseCase';
import { Configuration, OpenAIApi } from "openai";
import { config } from 'dotenv';

config()

export type QrCode = {
    base64Qr: string;
}

export class SenderProvider implements ISenderProvider{

    private client?: Whatsapp;
    private connected: boolean = false;
    private qr: QrCode = {
        base64Qr: ''
    };

    
    get isConnected() : boolean {
        return this.connected;
    }

    get qrCode() : QrCode {
        return this.qr;
    }
    

    constructor() {
        this.initialize()
    };

    private initialize() {

        
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        
        const qr = (base64Qr: string) => {
            this.qr = { base64Qr };
        }

        const status = (statusSession: string, session: string) => {
            this.connected = ['isLogged', 'qrReadSuccess', 'ChatAvailable'].includes(statusSession);
        }

        const start = (client: Whatsapp) => {
            this.client = client;


            client.onStateChange((state) => {
                console.log(state);
                
                this.connected = state === SocketState.CONNECTED;
            });

            client.onMessage(async (message) => {
                console.log(message.content)

                const text = message.content || '';
                if (text.trim().length === 0) {
                    return 'Error menssager erada'
                } 

                try {
                    const completion = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: text,
                    temperature: 0,
                    max_tokens: 1000,
                    });
                    console.log(completion.data.choices[0].text);
                } catch(error : any) {
                    console.log(error)
                }
            }
            );
            };


        create('ws-wpp-provider', qr)
            .then((client) => {
                start(client);
            })
            .catch((error) => console.log(error));
    };

    async sendMessage(message: IMessage): Promise<void> {
        /*const messages = await this.client?.getAllMessagesInChat(message.to, true, true);
        messages?.forEach( message => {
            console.log(`${message.sender.pushname} - ${message.body.length > 50 ? '' : message.body}`)
        });*/
        await this.client?.sendText(message.to, message.body)
            .then(s => console.log(s))
            .catch(e => console.log(e));

    };

    async processingMessage(message: IMessage): Promise<Object> {
        const res = await this.client?.sendText(message.to, message.body)
            .then(success => { 
                return success 
            })
            .catch(error => {
                return error 
            });

        return res;
    }

    async batteryLevel(): Promise<void> {
        const porcent = await this.client?.getBatteryLevel();
        console.log(porcent);
    };

    async connectionState(): Promise<void> {
        const wifi = await this.client?.getConnectionState();
        console.log(wifi);
    };

    async checkNumber(number: string): Promise<boolean> {
        const exist: any = await this.client?.checkNumberStatus(number)
            .then( result => {return result.numberExists})
            .catch(err => {
                console.log(err);
                return false;
            });

        return exist;
    };
};