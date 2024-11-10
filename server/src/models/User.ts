import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  businessName: string;
  businessFiles: Array<{
    fileName: string;
    content: string;
    uploadDate: Date;
  }>;
  whatsappNumber?: string;
  isWhatsappActive: boolean;
  maxBots: number;
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  businessName: { 
    type: String, 
    required: true 
  },
  businessFiles: [{
    fileName: String,
    content: String,
    uploadDate: Date
  }],
  whatsappNumber: String,
  isWhatsappActive: { 
    type: Boolean, 
    default: false 
  },
  maxBots: {
    type: Number,
    default: 2,
    min: 1
  }
});

export const User = mongoose.model<IUser>('User', userSchema); 