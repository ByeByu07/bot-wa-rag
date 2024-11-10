import mongoose, { Document, Schema } from 'mongoose';

export interface IBot extends Document {
  userId: string;
  name: string;
  description?: string;
  whatsappNumber?: string;
  isActive: boolean;
  createdAt: Date;
  lastActive?: Date;
}

const botSchema = new Schema<IBot>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  whatsappNumber: String,
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: Date
});

export const Bot = mongoose.model<IBot>('Bot', botSchema); 