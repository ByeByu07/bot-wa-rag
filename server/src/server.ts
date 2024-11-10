import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connectDB } from './config/db';
import { authRouter } from './routes/auth';
// import { documentsRouter } from './routes/documents';
// import { whatsappRouter } from './routes/whatsapp';
import { botsRouter } from './routes/bots';
import helmet from 'helmet';

config();

const app = express();

app.use(helmet());
// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://bot-wa-rag-client-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
// app.use('/api/documents', documentsRouter);
// app.use('/api/whatsapp', whatsappRouter);
app.use('/api/bots', botsRouter);

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 