import { ClaudeService } from '../ClaudeService';

// Mock the Anthropic SDK
const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  }));
});

describe('ClaudeService', () => {
  let claudeService: ClaudeService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    claudeService = new ClaudeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if ANTHROPIC_API_KEY is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      expect(() => new ClaudeService()).toThrow('ANTHROPIC_API_KEY environment variable is required');
    });

    it('should initialize successfully with API key', () => {
      expect(() => new ClaudeService()).not.toThrow();
    });
  });

  describe('sendMessage', () => {
    it('should send message and return response', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Hello! How can I help you today?',
          },
        ],
      };
      
      mockCreate.mockResolvedValue(mockResponse);

      const result = await claudeService.sendMessage('Hello');

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: expect.stringContaining('intelligent enterprise assistant'),
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      });
      
      expect(result).toBe('Hello! How can I help you today?');
    });

    it('should include context in system prompt when provided', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Response with context' }],
      };
      
      mockCreate.mockResolvedValue(mockResponse);

      await claudeService.sendMessage('Test message', 'GitHub: repo1, repo2');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('Context from enterprise systems:\nGitHub: repo1, repo2'),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(claudeService.sendMessage('Hello')).rejects.toThrow('Failed to get response from Claude');
    });

    it('should return fallback message when no text content', async () => {
      const mockResponse = {
        content: [{ type: 'image', data: 'image-data' }],
      };
      
      mockCreate.mockResolvedValue(mockResponse);

      const result = await claudeService.sendMessage('Hello');
      expect(result).toBe('Sorry, I could not generate a response.');
    });
  });
});