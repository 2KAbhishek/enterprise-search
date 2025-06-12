import { Router, Request, Response } from 'express';
import { ChatService } from '@/services/ChatService';
import { validateChatRequest } from '@/middleware/validation';

const router = Router();

router.post('/', validateChatRequest, async (req: Request, res: Response) => {
  try {
    const chatService = req.app.locals.chatService();
    if (!chatService) {
      throw new Error('ChatService not initialized');
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

// Debug endpoint to check MCP tools (only in development)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/tools', async (req: Request, res: Response) => {
    try {
      const chatService = req.app.locals.chatService();
      if (!chatService) {
        return res.json({ error: 'ChatService not initialized' });
      }

      const mcpService = (chatService as any).mcpService;
      if (!mcpService) {
        return res.json({ error: 'MCP service not available' });
      }

      const connectedServers = mcpService.getConnectedServers();
      const allTools = await mcpService.getAvailableTools();
      
      return res.json({
        connectedServers,
        serverCount: connectedServers.length,
        toolSummary: Object.entries(allTools).map(([server, tools]: [string, any]) => ({
          server,
          toolCount: tools?.tools?.length || 0,
          tools: tools?.tools?.map((t: any) => ({ name: t.name, description: t.description })) || []
        }))
      });
    } catch (error) {
      console.error('Debug tools error:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
}

export { router as chatRouter };