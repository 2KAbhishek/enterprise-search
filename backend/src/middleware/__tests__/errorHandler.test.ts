import {Request, Response, NextFunction} from 'express';
import {errorHandler} from '../errorHandler';

describe('Error Handler Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should handle error with custom status', () => {
        const customError = new Error('Custom error message');
        (customError as any).status = 404;

        errorHandler(
            customError,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error occurred:',
            customError
        );
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Custom error message',
            timestamp: expect.any(String)
        });
    });

    it('should handle error without custom status (default to 500)', () => {
        const genericError = new Error('Something went wrong');

        errorHandler(
            genericError,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error occurred:',
            genericError
        );
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Internal server error',
            timestamp: expect.any(String)
        });
    });

    it('should mask internal error messages for 500 status', () => {
        const internalError = new Error('Database connection failed');
        (internalError as any).status = 500;

        errorHandler(
            internalError,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Internal server error',
            timestamp: expect.any(String)
        });
    });

    it('should show custom error messages for non-500 status', () => {
        const validationError = new Error('Invalid input data');
        (validationError as any).status = 400;

        errorHandler(
            validationError,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Invalid input data',
            timestamp: expect.any(String)
        });
    });

    it('should include valid timestamp', () => {
        const error = new Error('Test error');

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(new Date(call.timestamp)).toBeInstanceOf(Date);
    });

    it('should log error to console', () => {
        const error = new Error('Test error for logging');

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred:', error);
    });
});
