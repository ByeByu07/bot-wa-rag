import { Document as LangchainDocument } from "langchain/document";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { Embedding, IEmbedding } from '../models/Embedding';
import { BotDocument } from '../models/BotDocument';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// if (!process.env.OPENAI_API_KEY) {
//   throw new Error('OPENAI_API_KEY environment variable is not set');
// }

interface DocumentMetadata {
  userId: string;
  fileName: string;
  documentId: string;
}

class RAGService {
  private embeddings: OpenAIEmbeddings;
  private model: ChatOpenAI;

  constructor() {
    // Explicitly pass the API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-small",
    });

    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });
  }

  async addDocument(userId: string, content: string, metadata: Omit<DocumentMetadata, 'userId'>): Promise<void> {
    // Tambahkan log untuk memastikan dokumen tersimpan
    console.log('Saving document:', { userId, fileName: metadata.fileName, documentId: metadata.documentId });
    
    // Generate embedding for the content
    const embedding = await this.embeddings.embedQuery(content);

    // Create new embedding document
    const embeddingDoc = new Embedding({
      userId,
      fileName: metadata.fileName,
      documentId: metadata.documentId,
      pageContent: content,
      embedding
    });

    // Save to MongoDB
    await embeddingDoc.save();
    console.log('Document saved successfully');
  }

  async query(userId: string, botId: string, message: string): Promise<{ text: string }> {
    try {
      // Tambahkan log untuk debugging
      console.log('Querying for:', { userId, botId });
      
      // Get bot's documents
      const botDocuments = await BotDocument.find({ botId, userId });
      console.log('Found bot documents:', botDocuments.length);
      
      const documentIds = botDocuments.map(bd => bd.documentId);
      console.log('Document IDs:', documentIds);

      if (documentIds.length === 0) {
        return { text: "Maaf, saya tidak memiliki dokumen referensi untuk menjawab pertanyaan Anda." };
      }

      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(message);

      // Get document embeddings and perform similarity search
      const documents = await Embedding.find({
        documentId: { $in: documentIds },
        userId
      });

      // Calculate cosine similarity between query and each document
      const similarities = documents.map(doc => ({
        document: doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Sort by similarity and take top 3 most relevant documents
      const topDocuments = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
        .map(item => item.document);

      // Combine content from top relevant documents
      const context = topDocuments.map(doc => doc.pageContent).join('\n\n');

      // Generate response using ChatGPT
      const response = await this.model.call([
        { 
          role: 'system', 
          content: `Anda adalah asisten AI yang membantu. Gunakan HANYA konteks yang diberikan untuk menjawab pertanyaan.
                   Jika pertanyaan tidak dapat dijawab dari konteks, katakan bahwa Anda tidak memiliki informasi yang cukup.
                   Jawablah dalam Bahasa Indonesia yang formal dan profesional. Dan jawab secara santai seperti teman sendiri`
        },
        { 
          role: 'user', 
          content: `Konteks:\n${context}\n\nPertanyaan: ${message}`
        }
      ]);
      // @ts-ignore
      return { text: response.content };
    } catch (error) {
      console.error('Error in RAG query:', error);
      return { text: "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda." };
    }
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
}

export default new RAGService(); 