import mongoose, { Document, Schema } from 'mongoose';

export interface IEmbedding extends Document {
  userId: string;
  fileName: string;
  documentId: string;
  pageContent: string;
  embedding: number[];
}

const embeddingSchema = new Schema<IEmbedding>({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  documentId: { 
    type: String, 
    required: true 
  },
  pageContent: { 
    type: String, 
    required: true 
  },
  embedding: [Number]
});

// Create an index on the embedding field for vector search
embeddingSchema.index({ embedding: '2dsphere' });

export const Embedding = mongoose.model<IEmbedding>('Embedding', embeddingSchema); 