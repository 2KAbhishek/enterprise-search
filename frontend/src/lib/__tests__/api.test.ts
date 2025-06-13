import {ApiClient, apiClient} from '../api';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
    let client: ApiClient;

    beforeEach(() => {
        client = new ApiClient();
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('sendMessage', () => {
        it('sends POST request with correct parameters', async () => {
            const mockResponse = {
                success: true,
                response: 'Test response',
                timestamp: '2023-01-01T00:00:00.000Z'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as unknown as Response);

            const result = await client.sendMessage('test message');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/chat',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({message: 'test message'})
                }
            );

            expect(result).toEqual(mockResponse);
        });

        it('handles API error responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            } as unknown as Response);

            await expect(client.sendMessage('test')).rejects.toThrow(
                'HTTP 500: Internal Server Error'
            );
        });

        it('handles network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(client.sendMessage('test')).rejects.toThrow(
                'Network error'
            );
        });

        it('logs API request failures', async () => {
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation();

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(client.sendMessage('test')).rejects.toThrow();

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('checkHealth', () => {
        it('sends GET request to health endpoint', async () => {
            const mockResponse = {
                status: 'ok',
                service: 'enterprise-search',
                version: '1.0.0',
                timestamp: '2023-01-01T00:00:00.000Z',
                environment: 'development'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as unknown as Response);

            const result = await client.checkHealth();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/health',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            expect(result).toEqual(mockResponse);
        });

        it('handles health check failures', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable'
            } as unknown as Response);

            await expect(client.checkHealth()).rejects.toThrow(
                'HTTP 503: Service Unavailable'
            );
        });
    });

    describe('getServers', () => {
        it('sends GET request to servers endpoint', async () => {
            const mockResponse = {
                success: true,
                servers: [
                    {
                        name: 'GitHub',
                        status: 'connected' as const,
                        toolCount: 5,
                        tools: [],
                        error: null
                    }
                ],
                totalServers: 1,
                connectedCount: 1,
                totalTools: 5
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as unknown as Response);

            const result = await client.getServers();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/chat/servers',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            expect(result).toEqual(mockResponse);
        });

        it('handles servers endpoint failures', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            } as unknown as Response);

            await expect(client.getServers()).rejects.toThrow(
                'HTTP 404: Not Found'
            );
        });
    });

    describe('request method', () => {
        it('includes custom headers when provided', async () => {
            const mockResponse = {data: 'test'};

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as unknown as Response);

            await client['request']('/test', {
                headers: {
                    Authorization: 'Bearer token',
                    'Custom-Header': 'value'
                }
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/test',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer token',
                        'Custom-Header': 'value'
                    })
                })
            );
        });

        it('merges request options correctly', async () => {
            const mockResponse = {data: 'test'};

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as unknown as Response);

            await client['request']('/test', {
                method: 'PUT',
                body: 'test body',
                cache: 'no-cache'
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/test',
                {
                    method: 'PUT',
                    body: 'test body',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        });

        it('uses default API URL when env var not set', async () => {
            delete process.env.NEXT_PUBLIC_API_URL;

            const newClient = new ApiClient();
            const mockResponse = {data: 'test'};

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as unknown as Response);

            await newClient['request']('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/test',
                expect.any(Object)
            );
        });

        it('handles JSON parsing errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                }
            } as unknown as Response);

            await expect(client['request']('/test')).rejects.toThrow(
                'Invalid JSON'
            );
        });
    });

    describe('apiClient singleton', () => {
        it('exports a singleton instance', () => {
            expect(apiClient).toBeInstanceOf(ApiClient);
        });

        it('returns the same instance on multiple imports', () => {
            expect(apiClient).toBe(apiClient);
        });
    });

    describe('error handling', () => {
        it('preserves original error message', async () => {
            const originalError = new Error('Original error message');
            mockFetch.mockRejectedValueOnce(originalError);

            await expect(client.sendMessage('test')).rejects.toThrow(
                'Original error message'
            );
        });

        it('handles fetch timeout', async () => {
            const timeoutError = new Error('fetch timeout');
            mockFetch.mockRejectedValueOnce(timeoutError);

            await expect(client.checkHealth()).rejects.toThrow('fetch timeout');
        });

        it('handles malformed response status', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: undefined,
                statusText: undefined
            } as unknown as Response);

            await expect(client.getServers()).rejects.toThrow(
                'HTTP undefined: undefined'
            );
        });
    });
});
