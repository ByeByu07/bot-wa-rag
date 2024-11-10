import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Bot } from '../models/Bot';
import whatsappService from '../services/whatsappService';
import { AuthRequest } from '../types/express';
import { User } from '../models/User';
import { BotDocument } from '../models/BotDocument';
import Document, { IDocument } from '../models/Document';
import { processFile } from '../utils/fileProcessing';
import ragService from '../services/ragService';
import multer from 'multer';
import { promises as fs } from 'fs';
import { Embedding } from '../models/Embedding';

const router = Router();

// Add a delay utility function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add this configuration after the imports and before the router definition
const upload = multer({ dest: 'uploads/' });

// Get all bots for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    console.log('Decoded User ID:', userId);
    
    const user = await User.findById(userId);
    console.log('Found User:', user);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const bots = await Bot.find({ userId });
    res.json(bots);
  } catch (error) {
    console.error('Error in GET /bots:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});


// Create new bot
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?._id);

    const { name, description } = req.body;
    const userId = req.user?._id;

    // Get user's max bots limit
      const user = await User.findById(userId);
      console.log('User:', user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

    // Check current number of bots for the user
    const userBotsCount = await Bot.countDocuments({ userId });
    
    if (userBotsCount >= user.maxBots) {
      return res.status(400).json({ 
        error: `Maximum number of bots (${user.maxBots}) reached. Please delete an existing bot before creating a new one.`
      });
    }

    const bot = new Bot({
      userId,
      name,
      description
    });
    await bot.save();
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Initialize bot and get QR code
router.post('/:botId/initialize', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { qrCode } = await whatsappService.initializeBot(
      req.user?._id as string,
      req.params.botId
    );
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Disconnect bot
router.post('/:id/disconnect', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const botId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Use the WhatsApp service to disconnect
    await whatsappService.disconnectBot(userId.toString(), botId);
    
    // Update bot status to inactive
    await Bot.findByIdAndUpdate(botId, { isActive: false });

    res.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect bot' });
  }
});

// Get bot status
router.get('/:botId/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const status = await whatsappService.getBotStatus(
      req.user?._id as string,
      req.params.botId
    );
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete bot
router.delete('/:botId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { botId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First disconnect the bot if it's active
    await whatsappService.disconnectBot(userId.toString(), botId);

    // Delete the bot from database
    const bot = await Bot.findOneAndDelete({ _id: botId, userId });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Associate documents with a bot
router.post('/:botId/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { documentIds } = req.body;
    const userId = req.user?._id;
    const { botId } = req.params;

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Create bot-document associations
    const botDocuments = documentIds.map((documentId: string) => ({
      botId,
      documentId,
      userId
    }));

    await BotDocument.insertMany(botDocuments);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get documents associated with a bot
router.get('/:botId/documents', authenticateToken , async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { botId } = req.params;

    const botDocuments = await BotDocument.find({ botId, userId });
    const documentIds = botDocuments.map(bd => bd.documentId);

    // Fetch the actual documents
    const documents = await Document.find({
      _id: { $in: documentIds },
      userId
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Remove document from bot
router.delete('/:botId/documents/:documentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { botId, documentId } = req.params;

    // Delete the bot-document association
    await BotDocument.findOneAndDelete({ botId, documentId, userId });
    
    // Delete the document from MongoDB
    await Document.findOneAndDelete({ _id: documentId, userId });

    // Delete the embeddings from the vector store
    await Embedding.deleteOne({ userId: userId?.toString(), documentId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add document upload endpoint to bot routes
router.post('/:botId/documents/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  const file = req.file;
  
  try {
    const userId = req.user?._id;
    const { botId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {    
      return res.status(400).json({ error: 'File is required' });
    }

    // Validate mime type
    const supportedMimeTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!supportedMimeTypes.includes(file.mimetype)) {
      // Clean up the uploaded file
      await fs.unlink(file.path);
      return res.status(400).json({ 
        error: 'Unsupported file type. Please upload a .txt, .pdf, or .docx file' 
      });
    }

    // Verify bot ownership
    const bot = await Bot.findOne({ _id: botId, userId });
    if (!bot) {
      // Clean up the uploaded file
      await fs.unlink(file.path);
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Extract text from file
    const content = await processFile(file.path, file.mimetype);

    // Store in MongoDB
    const doc = new Document({
      userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      content,
      metadata: {
        uploadDate: new Date(),
        fileSize: file.size,
        processingStatus: 'completed'
      }
    }) as unknown as IDocument;
    await doc.save();

    // Create bot-document association
    await BotDocument.create({
      botId,
      documentId: doc._id,
      userId
    });

    // Add to vector store
    await ragService.addDocument(userId, content, {
      fileName: file.originalname,
      documentId: doc._id.toString(),
      namespace: userId.toString(),
      metadata: {
        userId: userId.toString(),
        fileName: file.originalname,
        uploadDate: new Date().toISOString(),
        botId
      }
    });

    // Clean up the uploaded file after processing
    await fs.unlink(file.path);

    res.json({ success: true, documentId: doc._id });
  } catch (error) {
    console.error('Error uploading document:', error);
    // Clean up the uploaded file if it exists
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ error: (error as Error).message });
  }
});

export { router as botsRouter }; 