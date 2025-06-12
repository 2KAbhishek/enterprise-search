import Anthropic from '@anthropic-ai/sdk';
import { MCPService } from './MCPService';

interface Message {
  role: 'user' | 'assistant';
  content: string | any[];
}

export class ClaudeService {
  private client: Anthropic;
  private mcpService?: MCPService;
  private conversationHistory: Message[] = [];
  private toolToServerMap: Map<string, string> = new Map();

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  setMCPService(mcpService: MCPService): void {
    this.mcpService = mcpService;
  }

  async sendMessage(message: string, context?: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });
      
      // Keep only last 10 messages to manage context length
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const systemPrompt = await this.buildSystemPrompt(context);
      const tools = await this.getMCPTools();
      
      let messages = [...this.conversationHistory];
      let finalResponse = '';

      // Initial request to Claude
      const requestParams: any = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages,
      };

      if (tools.length > 0) {
        requestParams.tools = tools;
      }

      const response = await this.client.messages.create(requestParams);

      let hasToolCalls = false;
      let toolResults: any[] = [];

      // Process tool calls if any
      for (const block of response.content) {
        if (block.type === 'text') {
          finalResponse += block.text;
        } else if (block.type === 'tool_use' && this.mcpService) {
          hasToolCalls = true;
          try {
            // Find which server this tool belongs to using our mapping
            const serverName = this.toolToServerMap.get(block.name);
            if (!serverName) {
              throw new Error(`Tool ${block.name} not found in any connected MCP server`);
            }
            
            const toolResult = await this.mcpService.callTool(serverName, block.name, block.input);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(toolResult.content)
            });
          } catch (error) {
            console.error(`Tool call failed for ${block.name}:`, error);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              is_error: true
            });
          }
        }
      }

      // If there were tool calls, continue the conversation with tool results
      if (hasToolCalls && toolResults.length > 0) {
        // Add assistant's response with tool calls
        messages.push({ role: 'assistant', content: response.content });
        
        // Add tool results as a user message
        messages.push({ role: 'user', content: toolResults });

        // Get Claude's response to the tool results
        const followUpParams: any = {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages,
        };

        if (tools.length > 0) {
          followUpParams.tools = tools;
        }

        const followUpResponse = await this.client.messages.create(followUpParams);

        // Extract the final response text
        const followUpText = followUpResponse.content.find(block => block.type === 'text');
        finalResponse = followUpText?.text || '';
        
        // Update conversation history with final response
        this.conversationHistory.push({ 
          role: 'assistant', 
          content: response.content.map(block => 
            block.type === 'text' ? block.text : `[Tool: ${block.type === 'tool_use' ? block.name : 'unknown'}]`
          ).join('\n')
        });
        this.conversationHistory.push({ 
          role: 'user', 
          content: toolResults.map(r => `Tool result: ${r.content}`).join('\n')
        });
        this.conversationHistory.push({ role: 'assistant', content: finalResponse });
      } else {
        // No tool calls, just add the response to history
        this.conversationHistory.push({ role: 'assistant', content: finalResponse });
      }

      return finalResponse || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  private async getMCPTools(): Promise<any[]> {
    if (!this.mcpService) {
      return [];
    }

    try {
      const allToolsData = await this.mcpService.getAvailableTools();
      const tools: any[] = [];

      // Clear the mapping
      this.toolToServerMap.clear();

      for (const [serverName, serverTools] of Object.entries(allToolsData)) {
        if (serverTools && typeof serverTools === 'object' && 'tools' in serverTools) {
          const serverToolsList = (serverTools as any).tools;
          if (Array.isArray(serverToolsList)) {
            serverToolsList.forEach((tool: any) => {
              // Store the mapping separately
              this.toolToServerMap.set(tool.name, serverName);
              
              tools.push({
                name: tool.name,
                description: `[${serverName}] ${tool.description || 'No description'}`,
                input_schema: tool.inputSchema || {
                  type: 'object',
                  properties: {},
                  required: []
                }
              });
            });
          }
        }
      }

      return tools;
    } catch (error) {
      console.warn('Could not get MCP tools:', error);
      return [];
    }
  }

  private async buildSystemPrompt(context?: string): Promise<string> {
    let prompt = `You are an intelligent enterprise assistant that helps users find information and answer questions about their enterprise systems and data.

You have access to enterprise tools through Model Context Protocol (MCP) that can interact with systems like GitHub, Jira, Confluence, Slack, and Bitbucket.

Guidelines:
- Use the available tools to get real-time information when users ask about enterprise data
- Provide helpful, accurate, and concise responses
- If you don't have enough information, ask clarifying questions or use tools to get more data
- Format responses clearly with proper structure when appropriate
- Be professional but friendly in tone
- When users ask about repositories, files, or GitHub data, use the GitHub tools
- When users ask about issues, tickets, or project management, use the Jira/Atlassian tools
- Choose the appropriate tool based on the type of information requested`;

    if (context) {
      prompt += `\n\nContext from enterprise systems:\n${context}`;
    }

    return prompt;
  }
}