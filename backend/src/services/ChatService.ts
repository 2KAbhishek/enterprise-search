import { ClaudeService } from '@/services/ClaudeService';
import { MCPService } from '@/services/MCPService';

export class ChatService {
  private claudeService: ClaudeService;
  private mcpService: MCPService;
  private isInitialized = false;

  constructor() {
    this.claudeService = new ClaudeService();
    this.mcpService = new MCPService();
    this.initialize().catch(error => {
      console.error('Failed to initialize ChatService:', error);
    });
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.mcpService.connectToServers();
      this.isInitialized = true;
      console.log('✅ ChatService initialized successfully');
    } catch (error) {
      console.error('❌ ChatService initialization failed:', error);
    }
  }

  async sendMessage(message: string): Promise<string> {
    try {
      await this.initialize();

      const connectedServers = this.mcpService.getConnectedServers();
      console.log(`Processing message with ${connectedServers.length} MCP servers connected`);

      let mcpContext = '';
      
      if (connectedServers.length > 0) {
        mcpContext = await this.mcpService.queryAllServers(message);
      }

      const response = await this.claudeService.sendMessage(message, mcpContext);
      
      return response;
    } catch (error) {
      console.error('Error in ChatService.sendMessage:', error);
      throw new Error('Failed to process your message. Please try again.');
    }
  }

  async shutdown(): Promise<void> {
    await this.mcpService.disconnect();
    console.log('ChatService shutdown complete');
  }
}