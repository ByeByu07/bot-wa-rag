import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { Bot, IBot } from '../models/Bot';
import ragService from './ragService';

interface ClientInstance {
  client: Client;
  status: 'initializing' | 'ready' | 'disconnected';
  lastActive: Date;
}

class WhatsAppService {
  private clients: Map<string, ClientInstance>;
  private qrCallbacks: Map<string, (qr: string) => void>;

  constructor() {
    this.clients = new Map();
    this.qrCallbacks = new Map();
  }

  async initializeBot(userId: string, botId: string): Promise<{ qrCode?: string }> {
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      throw new Error('Bot not found');
    }

    const clientKey = `${userId}-${botId}`;
    const existingClient = this.clients.get(clientKey);
    
    if (existingClient && existingClient.status === 'ready') {
      return {};
    }

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: clientKey }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        executablePath: process.env.NODE_ENV === 'production' 
          ? '/usr/bin/google-chrome'
          : undefined,
      }
    });

    return new Promise((resolve, reject) => {
      client.on('qr', async (qr) => {
        try {
          const qrCode = await qrcode.toDataURL(qr);
          resolve({ qrCode });
        } catch (error) {
          reject(error);
        }
      });

      client.on('ready', async () => {
        console.log(`Bot ${botId} is ready!`);
        this.clients.set(clientKey, {
          client,
          status: 'ready',
          lastActive: new Date()
        });

        // Update bot status in database
        await Bot.findByIdAndUpdate(botId, {
          isActive: true,
          lastActive: new Date()
        });
      });

      client.on('message', async (message) => {
        if (!message.fromMe && !message.from.endsWith('@g.us')) {
          try {
            console.log('Received private message:', message.body);
            
            const response = await ragService.query(userId, botId, message.body);
            
            try {
              await message.reply(response.text);
            } catch (replyError) {
              console.error('Error replying to message:', replyError);
              const chat = await message.getChat();
              await chat.sendMessage(response.text);
            }
            
            const clientInstance = this.clients.get(clientKey);
            if (clientInstance) {
              clientInstance.lastActive = new Date();
            }
          } catch (error) {
            console.error('Error processing message:', error);
            try {
              const chat = await message.getChat();
              await chat.sendMessage('Maaf, saya mengalami kesalahan dalam memproses pesan Anda.');
            } catch (sendError) {
              console.error('Error sending error message:', sendError);
            }
          }
        }
      });

      client.initialize().catch(reject);
    });
  }

  async disconnectBot(userId: string, botId: string): Promise<void> {
    const clientKey = `${userId}-${botId}`;
    const clientInstance = this.clients.get(clientKey);
    
    if (clientInstance) {
      try {
        // Logout dari WhatsApp
        await clientInstance.client.logout();
        
        // Update status client
        clientInstance.status = 'disconnected';
        this.clients.set(clientKey, {
          ...clientInstance,
          status: 'disconnected',
          lastActive: new Date()
        });
        
        // Update status bot di database
        await Bot.findByIdAndUpdate(botId, {
          isActive: false,
          lastActive: new Date()
        });
      } catch (error) {
        console.error('Error disconnecting bot:', error);
        throw new Error('Failed to disconnect bot');
      }
    }
  }

  async getBotStatus(userId: string, botId: string): Promise<{
    isActive: boolean;
    lastActive?: Date;
  }> {
    const clientKey = `${userId}-${botId}`;
    const clientInstance = this.clients.get(clientKey);
    
    if (clientInstance) {
      return {
        isActive: clientInstance.status === 'ready',
        lastActive: clientInstance.lastActive
      };
    }

    const bot = await Bot.findOne({ _id: botId, userId });
    return {
      isActive: false,
      lastActive: bot?.lastActive
    };
  }
}

export default new WhatsAppService();