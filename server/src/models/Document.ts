import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: string;
  fileName: string;
  fileType: string;
  content: string;
  fileUrl: string;
  fileKey: string;
  metadata: {
    uploadDate: Date;
    fileSize: number;
    processingStatus: string;
  };
}

const documentSchema = new Schema<IDocument>({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  content: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileKey: { type: String, required: true },
  metadata: {
    uploadDate: { type: Date, default: Date.now },
    fileSize: Number,
    processingStatus: String
  }
});

export default mongoose.model<IDocument>('Document', documentSchema); 