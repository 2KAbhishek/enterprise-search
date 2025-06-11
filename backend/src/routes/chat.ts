import { Router, Request, Response } from 'express';
import { ChatService } from '@/services/ChatService';
import { validateChatRequest } from '@/middleware/validation';

const router = Router();
let chatService: ChatService;

router.post('/', validateChatRequest, async (req: Request, res: Response) => {
  try {
    if (!chatService) {
      chatService = new ChatService();
    }
    
    const { message } = req.body as { message: string };
    
    const response = await chatService.sendMessage(message);
    
    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as chatRouter };