import request from 'supertest';
import express from 'express';
import { chatRouter } from '../chat';
import { ChatService } from '../../services/ChatService';

// Mock ChatService
jest.mock('../../services/ChatService');

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

describe('Chat Router', () => {
  let mockChatService: jest.Mocked<ChatService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChatService = {
      sendMessage: jest.fn(),
      shutdown: jest.fn(),
    } as unknown as jest.Mocked<ChatService>;

    (ChatService as jest.Mock).mockImplementation(() => mockChatService);
  });

  describe('POST /api/chat', () => {
    it('should process valid chat message', async () => {
      mockChatService.sendMessage.mockResolvedValue('Hello! How can I help you?');

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        response: 'Hello! How can I help you?',
        timestamp: expect.any(String),
      });

      expect(mockChatService.sendMessage).toHaveBeenCalledWith('Hello');
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });

      expect(mockChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should reject missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    });

    it('should reject non-string message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 123 })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(10001);

      const response = await request(app)
        .post('/api/chat')
        .send({ message: longMessage })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Message is too long (max 10000 characters)',
      });
    });

    it('should handle whitespace-only message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '   \n\t   ' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    });

    it('should handle ChatService errors', async () => {
      mockChatService.sendMessage.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Failed to process chat message',
        timestamp: expect.any(String),
      });
    });

    it('should accept message at maximum length', async () => {
      const maxMessage = 'a'.repeat(10000);
      mockChatService.sendMessage.mockResolvedValue('Response');

      const response = await request(app)
        .post('/api/chat')
        .send({ message: maxMessage })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(maxMessage);
    });
  });
});