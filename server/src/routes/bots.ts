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
import { upload, uploadToR2 } from '../utils/storage';
import { Embedding } from '../models/Embedding';
import { deleteFromR2 } from '../utils/r2Storage';

const router = Router();

// Add a delay utility function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
// Remove document from bot
router.delete('/:botId/documents/:documentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { botId, documentId } = req.params;

    // First get the document to get the fileKey
    const document = await Document.findOne({ _id: documentId, userId });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from Cloudflare R2
    try {
      await deleteFromR2(document.fileKey);
    } catch (r2Error) {
      console.error('Error deleting from R2:', r2Error);
      // Continue with deletion even if R2 deletion fails
    }

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

// @ts-ignore
// Add document upload endpoint to bot routes
router.post('/:botId/documents/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  const file = req.file;
  
  try {
    const userId = req.user?._id;
    const { botId } = req.params;

    if (!userId || !file) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // First process the file while it's in memory
    let content: string;
    try {
      content = await processFile(file.buffer, file.mimetype);
    } catch (processingError) {
      console.error('File processing error:', processingError);
      return res.status(400).json({ 
        error: 'Failed to process file',
        details: processingError.message 
      });
    }

    // If processing succeeded, then upload to R2
    let uploadResult;
    try {
      uploadResult = await uploadToR2(file, userId.toString());
    } catch (uploadError) {
      console.error('R2 upload error:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload file',
        details: uploadError.message 
      });
    }

    try {
      // Store in MongoDB
      const doc = new Document({
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        content,
        fileUrl: uploadResult.url,
        fileKey: uploadResult.key,
        metadata: {
          uploadDate: new Date(),
          fileSize: file.size,
          processingStatus: 'completed'
        }
      });
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
        //@ts-ignore
        namespace: userId.toString(),
        metadata: {
          userId: userId.toString(),
          fileName: file.originalname,
          uploadDate: new Date().toISOString(),
          botId
        }
      });

      res.json({ success: true, documentId: doc._id });
    } catch (dbError) {
      // If database operations fail, clean up the uploaded file
      console.error('Database operation error:', dbError);
      try {
        await deleteFromR2(uploadResult.key);
      } catch (deleteError) {
        console.error('Failed to delete file from R2:', deleteError);
      }
      return res.status(500).json({ 
        error: 'Failed to save document',
        details: dbError.message 
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export { router as botsRouter }; 