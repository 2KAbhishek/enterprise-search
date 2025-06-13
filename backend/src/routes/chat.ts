import { Router, Request, Response } from 'express';
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

// MCP servers endpoint to get server information and status
router.get('/servers', async (req: Request, res: Response) => {
  try {
    const chatService = req.app.locals.chatService();
    if (!chatService) {
      return res.json({ 
        success: false, 
        error: 'ChatService not initialized',
        servers: []
      });
    }

    const mcpService = (chatService as any).mcpService;
    if (!mcpService) {
      return res.json({ 
        success: false, 
        error: 'MCP service not available',
        servers: []
      });
    }

    const connectedServers = mcpService.getConnectedServers();
    const allTools = await mcpService.getAvailableTools();
    
    const servers = Object.entries(allTools).map(([serverName, serverData]: [string, any]) => ({
      name: serverName,
      status: connectedServers.includes(serverName) ? 'connected' : 'disconnected',
      toolCount: serverData?.tools?.length || 0,
      tools: serverData?.tools?.map((tool: any) => ({
        name: tool.name,
        description: tool.description || 'No description available'
      })) || [],
      error: serverData?.error || null
    }));
    
    return res.json({
      success: true,
      servers,
      totalServers: servers.length,
      connectedCount: connectedServers.length,
      totalTools: servers.reduce((sum, server) => sum + server.toolCount, 0)
    });
  } catch (error) {
    console.error('MCP servers endpoint error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      servers: []
    });
  }
});

export { router as chatRouter };