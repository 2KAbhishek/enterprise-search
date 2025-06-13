import '@testing-library/jest-dom';

// Mock localStorage globally
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock matchMedia - default to dark theme preference
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});

// Mock console.error to reduce noise in tests
const originalError = console.error;
beforeEach(() => {
    console.error = jest.fn();
});

afterEach(() => {
    console.error = originalError;
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
