import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { chatRouter } from '@/routes/chat';
import { healthRouter } from '@/routes/health';
import { errorHandler } from '@/middleware/errorHandler';
import { ChatService } from '@/services/ChatService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let globalChatService: ChatService;

async function initializeServices() {
  console.log('🔄 Initializing services...');
  globalChatService = new ChatService();
  console.log('✅ Services initialized');
}

app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);

app.use(errorHandler);

app.locals.chatService = () => globalChatService;

app.listen(PORT, async () => {
  console.log(`🚀 Enterprise Search Backend running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  await initializeServices();
});