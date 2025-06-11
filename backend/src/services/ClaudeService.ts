import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  async sendMessage(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const textContent = response.content.find(block => block.type === 'text');
      return textContent?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  private buildSystemPrompt(context?: string): string {
    let prompt = `You are an intelligent enterprise assistant that helps users find information and answer questions about their enterprise systems and data.

You have access to enterprise data through Model Context Protocol (MCP) servers that can provide information from systems like GitHub, Jira, Confluence, Slack, and Bitbucket.

Guidelines:
- Provide helpful, accurate, and concise responses
- If you don't have enough information, ask clarifying questions
- Format responses clearly with proper structure when appropriate
- Be professional but friendly in tone
- If asked to perform actions, explain what you would do if you had the capability`;

    if (context) {
      prompt += `\n\nContext from enterprise systems:\n${context}`;
    }

    return prompt;
  }
}