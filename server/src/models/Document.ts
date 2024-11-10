import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

// Interface for the document metadata
interface DocumentMetadata {
  uploadDate: Date;
  fileSize: number;
  processingStatus: string;
}

// Interface for the document
export interface IDocument extends MongooseDocument {
  userId: Types.ObjectId;
  fileName: string;
  fileType: string;
  content: string;
  vectorId?: string;
  metadata: DocumentMetadata;
}

const documentSchema = new Schema<IDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  content: { type: String, required: true },
  vectorId: String, // Reference to vector store
  metadata: {
    uploadDate: { type: Date, default: Date.now },
    fileSize: Number,
    processingStatus: String
  }
});

export default model<IDocument>('Document', documentSchema); 