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

            if (tools.length > 0) {
                console.log(
                    `📋 Available tools: ${tools.map((t) => t.name).join(', ')}`
                );
            } else {
                console.log('⚠️ No MCP tools available');
            }

            const messages = [...this.conversationHistory];
            let finalResponse = '';

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

            for (const block of response.content) {
                if (block.type === 'text') {
                    finalResponse += block.text;
                } else if (block.type === 'tool_use' && this.mcpService) {
                    hasToolCalls = true;
                    console.log(
                        `🔧 Calling tool: ${block.name} with args:`,
                        block.input
                    );
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
                        console.log(
                            `✅ Tool ${block.name} executed successfully`
                        );
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: block.id,
                            content: JSON.stringify(toolResult.content)
                        });
                    } catch (error) {
                        console.error(
                            `❌ Tool call failed for ${block.name}:`,
                            error
                        );
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: block.id,
                            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            is_error: true
                        });
                    }
                }
            }

            if (hasToolCalls && toolResults.length > 0) {
                messages.push({role: 'assistant', content: response.content});

                messages.push({role: 'user', content: toolResults});

                const followUpParams: any = {
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 4000,
                    temperature: 0.7,
                    system: systemPrompt,
                    messages: messages
                };

                if (tools.length > 0) {
                    followUpParams.tools = tools;
                }

                const followUpResponse =
                    await this.client.messages.create(followUpParams);

                let followUpText = '';
                for (const block of followUpResponse.content) {
                    if (block.type === 'text') {
                        followUpText += block.text;
                    }
                }
                finalResponse = followUpText;

                this.conversationHistory.push({
                    role: 'assistant',
                    content: response.content
                        .map((block) =>
                            block.type === 'text'
                                ? block.text
                                : `[Tool: ${block.type === 'tool_use' ? block.name : 'unknown'}]`
                        )
                        .join('\n')
                });
                this.conversationHistory.push({
                    role: 'user',
                    content: toolResults
                        .map((r) => `Tool result: ${r.content}`)
                        .join('\n')
                });
                this.conversationHistory.push({
                    role: 'assistant',
                    content: finalResponse
                });
            } else {
                this.conversationHistory.push({
                    role: 'assistant',
                    content: finalResponse
                });
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

Guidelines:
- Use the available tools to get real-time information when users ask about enterprise data
- Provide helpful, accurate, and concise responses based on actual tool results
- If you don't have enough information, ask clarifying questions or use tools to get more data
- Format responses clearly with proper structure when appropriate
- Be professional but friendly in tone
- Always follow through on your stated actions with actual tool calls`;

        if (context) {
            prompt += `\n\nContext from enterprise systems:\n${context}`;
        }

        return prompt;
    }
}
