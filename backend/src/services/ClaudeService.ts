import Anthropic from '@anthropic-ai/sdk';
import {MCPService} from './MCPService';

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
            throw new Error(
                'ANTHROPIC_API_KEY environment variable is required'
            );
        }

        this.client = new Anthropic({
            apiKey
        });
    }

    setMCPService(mcpService: MCPService): void {
        this.mcpService = mcpService;
    }

    async sendMessage(message: string, context?: string): Promise<string> {
        try {
            this.conversationHistory.push({role: 'user', content: message});

            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            const systemPrompt = await this.buildSystemPrompt(context);
            const tools = await this.getMCPTools();

            console.log(`🔧 ${tools.length} MCP tools available for this request`);

            return await this.performIterativeToolCalling(systemPrompt, tools);
        } catch (error) {
            console.error('Claude API error:', error);
            throw new Error('Failed to get response from Claude');
        }
    }

    private async performIterativeToolCalling(systemPrompt: string, tools: any[]): Promise<string> {
        const messages = [...this.conversationHistory];
        let finalResponse = '';
        let maxIterations = 5; // Prevent infinite loops
        let iteration = 0;

        while (iteration < maxIterations) {
            iteration++;
            console.log(`🔄 Iteration ${iteration}: Processing request`);

            const requestParams: any = {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4000,
                temperature: 0.7,
                system: systemPrompt,
                messages: messages
            };

            if (tools.length > 0) {
                requestParams.tools = tools;
            }

            const response = await this.client.messages.create(requestParams);

            let hasToolCalls = false;
            const toolResults: any[] = [];
            let textResponse = '';

            // Process response content
            for (const block of response.content) {
                if (block.type === 'text') {
                    textResponse += block.text;
                } else if (block.type === 'tool_use' && this.mcpService) {
                    hasToolCalls = true;
                    console.log(`\n🔧 === MCP Tool Call ===`);
                    console.log(`Tool: ${block.name}`);
                    console.log(`Parameters:`, JSON.stringify(block.input, null, 2));
                    
                    try {
                        const serverName = this.toolToServerMap.get(block.name);
                        if (!serverName) {
                            throw new Error(
                                `Tool ${block.name} not found in any connected MCP server`
                            );
                        }

                        const toolResult = await this.mcpService.callTool(
                            serverName,
                            block.name,
                            block.input
                        );
                        
                        // Log detailed tool response
                        console.log(`📋 Response from ${block.name}:`, JSON.stringify(toolResult.content, null, 2));
                        console.log(`✅ Tool call completed successfully\n`);
                        
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: block.id,
                            content: JSON.stringify(toolResult.content)
                        });
                    } catch (error) {
                        console.error(`❌ Tool call failed for ${block.name}:`, error);
                        console.log(``);
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: block.id,
                            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            is_error: true
                        });
                    }
                }
            }

            // If no tool calls, this is the final response
            if (!hasToolCalls) {
                finalResponse = textResponse;
                this.conversationHistory.push({
                    role: 'assistant',
                    content: finalResponse
                });
                break;
            }

            // If tool calls were made, add them to conversation and continue
            if (toolResults.length > 0) {
                // Add assistant's tool use to conversation
                messages.push({role: 'assistant', content: response.content});
                
                // Add tool results
                messages.push({role: 'user', content: toolResults});

                // Check if we should continue iterating
                // LLM can decide whether to make more tool calls or provide final response
                console.log(`🔄 Tools executed, preparing for next iteration`);
            } else {
                // No tool results but had tool calls (all failed)
                finalResponse = textResponse || 'I encountered errors while trying to access the requested information.';
                this.conversationHistory.push({
                    role: 'assistant',
                    content: finalResponse
                });
                break;
            }
        }

        if (iteration >= maxIterations) {
            console.log(`⚠️ Maximum iterations (${maxIterations}) reached`);
            finalResponse = 'I was unable to complete your request within the allowed processing time. Please try rephrasing your question.';
        }

        // Update conversation history with final state
        if (messages.length > this.conversationHistory.length) {
            this.conversationHistory = messages.slice();
        }

        return finalResponse || 'Sorry, I could not generate a response.';
    }

    private summarizeToolResult(content: any): string {
        if (typeof content === 'string') {
            return content.length > 100 ? content.substring(0, 100) + '...' : content;
        }
        
        if (Array.isArray(content)) {
            return `Array with ${content.length} items`;
        }
        
        if (typeof content === 'object' && content !== null) {
            const keys = Object.keys(content);
            return `Object with keys: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
        }
        
        return 'Data retrieved';
    }

    private async getMCPTools(): Promise<any[]> {
        if (!this.mcpService) {
            return [];
        }

        try {
            const allToolsData = await this.mcpService.getAvailableTools();
            const tools: any[] = [];

            this.toolToServerMap.clear();

            for (const [serverName, serverTools] of Object.entries(
                allToolsData
            )) {
                if (
                    serverTools &&
                    typeof serverTools === 'object' &&
                    'tools' in serverTools
                ) {
                    const serverToolsList = (serverTools as any).tools;
                    if (Array.isArray(serverToolsList)) {
                        serverToolsList.forEach((tool: any) => {
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

IMPORTANT INSTRUCTIONS:
- ALWAYS use the available tools when users ask about enterprise data, repositories, issues, or any specific information
- Do NOT say you will do something without actually calling the appropriate tool
- When users ask about GitHub repositories, IMMEDIATELY call the appropriate GitHub tools
- When users ask about issues or tickets, IMMEDIATELY call the appropriate Jira/Atlassian tools
- Do NOT provide generic responses when specific data is requested - use tools to get real data
- If you say "Let me check" or "Let me look up", you MUST follow through by calling the appropriate tool

ITERATIVE TOOL CALLING:
- You can make MULTIPLE tool calls across several rounds to gather comprehensive information
- If initial tool results don't provide enough information, make additional tool calls to get more details
- For complex queries, break them down into multiple tool calls (e.g., first get repositories, then get specific files or issues)
- Continue calling tools until you have sufficient information to provide a complete answer
- Each tool call should build upon previous results to create a comprehensive response

Guidelines:
- Use the available tools to get real-time information when users ask about enterprise data
- Make multiple tool calls if needed to fully answer the user's question
- Provide helpful, accurate, and concise responses based on actual tool results
- If you don't have enough information after initial tool calls, make additional calls to gather more data
- Format responses clearly with proper structure when appropriate
- Be professional but friendly in tone
- Always follow through on your stated actions with actual tool calls`;

        if (context) {
            prompt += `\n\nContext from enterprise systems:\n${context}`;
        }

        return prompt;
    }
}
