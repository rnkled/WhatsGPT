import { SenderProvider, QrCode } from './../provider/implementations/SenderProvider';
import { sendMessageController } from '../useCase/sendMessage';
import { baseProcessingController } from '../useCase/baseProcessing';
import { checkNumberController } from '../useCase/checkNumbers';
import { Configuration, OpenAIApi } from "openai";
import { config } from 'dotenv';
import { Request, Response, Router } from 'express';

config()
const router = Router();
const sender = new SenderProvider();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
router.post('/chat', async (req: Request, res: Response) => {
  if (!configuration.apiKey) {
    res.status(500).json({
        error: {
            message: "OpenAI API key not configured",
      }
    });
    return;
  }

  const text = req.body.text || '';
  if (text.trim().length === 0) {
    res.status(400).json({
      error: {
          message: "Please enter a valid text",
      }
  });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      temperature: 0.6,
    });
    console.log(completion);
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error : any) {
      res.status(500).json({
          error: {
              message: error.message,
          }
      });
    }
  }
);


  
  
router.get('/status', (request, response) => {
        sender.batteryLevel();
        sender.connectionState();
        return response.send({
            qrCode: sender.qrCode,
            connected: sender.isConnected,
        });    
    }
);
router.post('/send/message', (request, response) => { return sendMessageController.handle(request, response, sender); });
router.post('/process/messages', (request, response) => { return baseProcessingController.handle(request, response, sender); });
router.post('/check/numbers', (request, response) => { return checkNumberController.handle(request, response, sender); });

export default router