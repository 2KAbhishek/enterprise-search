import { Request, Response, NextFunction } from 'express';
import { validateChatRequest } from '../validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('validateChatRequest', () => {
    it('should pass validation for valid message', () => {
      mockRequest.body = { message: 'Hello, how are you?' };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject missing message', () => {
      mockRequest.body = {};

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject null message', () => {
      mockRequest.body = { message: null };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject undefined message', () => {
      mockRequest.body = { message: undefined };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject non-string message', () => {
      mockRequest.body = { message: 123 };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject empty string message', () => {
      mockRequest.body = { message: '' };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject whitespace-only message', () => {
      mockRequest.body = { message: '   \n\t   ' };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject message that is too long', () => {
      const longMessage = 'a'.repeat(10001);
      mockRequest.body = { message: longMessage };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Message is too long (max 10000 characters)',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept message at maximum length', () => {
      const maxMessage = 'a'.repeat(10000);
      mockRequest.body = { message: maxMessage };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should accept message with valid content', () => {
      mockRequest.body = { message: 'What repositories do I have access to?' };

      validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});