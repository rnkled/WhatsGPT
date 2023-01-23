import mime from 'mime-types';
import { IReceiveMessageDTO } from "./ReceiveMessageDTO";
import fs from 'fs';

export async function ReceiveMessage({message, client}: IReceiveMessageDTO){
        if (message.type !== 'chat') {
            const buffer = await client.decryptFile(message);

            const path = `files/${message.chatId}`;

            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            };

            const filename = `${path}/arquivo_${message.id}.${mime.extension(message.mimetype)}`;
            await fs.writeFile(filename, buffer, err => {
                err ? console.log(err) : null ;
            });

            console.log(`File saved successfully in ${path}`);
        } else {

            console.log(message)

            if (message.content == '/help') {
                try {
                    const commands = ''+
                    '*/help - Lista de comandos*\n\n'+
                    '*/gasto - Registrar gasto ocasional*\n'+
                    '/gasto {motivo} {valor}\nEx.: /gasto comida 20\n\n'+
                    '*/fixo - Registrar gasto fixo*\n'+
                    '/fixo {motivo} {valor}\nEx.: /fixo energia 200\n\n'+
                    '*/parcela - Cadastrar gasto parcelado*\n'+
                    '/parcela {motivo} {valorMes} {parcelas} {cartao?}\nEx.: /parcela celular 2/10 PortoSeguro\n\n'+
                    '*/salario - Cadastra um salário recorrente*\n'+
                    '/salario {empresa} {valor}\nEx.: /salario mercafacil 3100\n\n'+
                    '*/entrada - Cadastra uma entrada*\n'+
                    '/entrada {origem} {valor}\nEx.: /entrada sogro 100\n\n'+
                    '*/contrato - Cadastra um contrato*\n'+
                    '/contrato {origem} {valor} {parcelas}\nEx.: /contrato TSP 2000 2/6'+
                    '';
                    await client.sendText('5516991344675@g.us', 'teste')
                        .then(s => console.log(s))
                        .catch(e => console.log(e));
                } catch (error) {
                    console.log(`Erro ao enviar mensagem: ${error}`);
                }
            } else if (message.content.split(' ')[0] === '/gasto') {
                try {
                    const motivo = message.content.split(' ')[1];
                    const valor = message.content.split(' ')[2];

                    const file = fs.readFileSync('./database/seed/gasto.json', 'utf-8');
                    console.log(file);
                    const gastosJSON = JSON.parse(file);
                    gastosJSON.gastos.push({motivo, valor, mesFinal: new Date().getMonth() + 1, ano: new Date().getFullYear()});
                    fs.writeFileSync('./database/seed/gasto.json', JSON.stringify(gastosJSON, null, '\t'));

                    const propsMessage = {
                        messageId: message.id,
                        chatId: message.chatId,
                        sender: message.sender.pushname,
                        name: message.sender.name,
                        number: message.from,
                        isMyContact: message.sender.isMyContact,
                        iconProfileImage: message.sender.profilePicThumbObj.img,
                        profileImage: message.sender.profilePicThumbObj.imgFull,
                        message: message.content,
                        timestamp: message.timestamp,
                        motivo,
                        valor
                    };

                    // await client.sendText('5516991344675@c.us', JSON.stringify(propsMessage, null, '\t'))
                    //     .then(s => console.log(s))
                    //     .catch(e => console.log(e));
                    await client.sendText('5516991344675@g.us', `Gasto ${motivo} - ${valor}$ inserido com sucesso`)
                        .then(s => console.log(s))
                        .catch(e => console.log(e));
                } catch (error) {
                    console.log(error);
                    await client.sendText('5516991344675@g.us', 'Erro ao inserir gasto')
                        .then(s => console.log(s))
                        .catch(e => console.log(e));
                };
                
            }
            // } else if() {

            // } else if() {

            // } else if() {

            // }
        };
    };