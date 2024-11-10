import mongoose, { Document, Schema } from 'mongoose';

export interface IBotDocument extends Document {
  botId: string;
  documentId: string;
  userId: string;
  createdAt: Date;
}

const botDocumentSchema = new Schema<IBotDocument>({
  botId: {
    type: String,
    required: true,
    index: true
  },
  documentId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
botDocumentSchema.index({ botId: 1, documentId: 1 }, { unique: true });

export const BotDocument = mongoose.model<IBotDocument>('BotDocument', botDocumentSchema); 