import '@testing-library/jest-dom';

// Mock localStorage globally
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => '[]'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    request: jest.fn().mockResolvedValue({
      result: {
        resources: [
          {
            uri: 'http://example.com/resource',
            name: 'test-resource',
            description: 'Test resource description',
            mimeType: 'text/plain'
          }
        ]
      }
    }),
    listResources: jest.fn().mockResolvedValue({
      resources: [
        {
          uri: 'http://example.com/resource',
          name: 'test-resource',
          description: 'Test resource description',
          mimeType: 'text/plain'
        }
      ]
    }),
    getCapabilities: jest.fn().mockResolvedValue({
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    })
  }))
}));

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined)
  }))
}));