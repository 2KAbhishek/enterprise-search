import { MCPClient } from '../client';
import { MCPServerConfig } from '@/types/mcp';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/sse.js');

describe('MCPClient', () => {
  let client: MCPClient;
  let mockServer: MCPServerConfig;

  beforeEach(() => {
    // Clear localStorage mock
    localStorage.clear();
    jest.clearAllMocks();
    
    client = new MCPClient();
    mockServer = {
      id: 'test-server',
      name: 'Test Server',
      endpoint: 'http://localhost:3001',
      type: 'jira',
      enabled: true,
      auth: {
        type: 'bearer',
        token: 'test-token'
      }
    };
  });

  describe('Server Management', () => {
    it('should add a server configuration', () => {
      client.addServer(mockServer);
      
      const servers = client.getServers();
      expect(servers).toHaveLength(1);
      expect(servers[0]).toEqual(mockServer);
      // Verify localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should remove a server configuration', () => {
      client.addServer(mockServer);
      client.removeServer(mockServer.id);
      
      const servers = client.getServers();
      expect(servers).toHaveLength(0);
      // Verify localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should update a server configuration', () => {
      client.addServer(mockServer);
      
      const updatedServer = {
        ...mockServer,
        name: 'Updated Server'
      };
      
      client.updateServer(updatedServer);
      
      const servers = client.getServers();
      expect(servers[0].name).toBe('Updated Server');
    });

    it('should filter enabled servers', () => {
      const disabledServer = {
        ...mockServer,
        id: 'disabled-server',
        enabled: false
      };
      
      client.addServer(mockServer);
      client.addServer(disabledServer);
      
      const enabledServers = client.getEnabledServers();
      expect(enabledServers).toHaveLength(1);
      expect(enabledServers[0].id).toBe('test-server');
    });
  });

  describe('Connection Management', () => {
    it('should successfully connect to an enabled server', async () => {
      client.addServer(mockServer);
      
      const connected = await client.connect(mockServer.id);
      expect(connected).toBe(true);
    });

    it('should fail to connect to a disabled server', async () => {
      const disabledServer = { ...mockServer, enabled: false };
      client.addServer(disabledServer);
      
      const connected = await client.connect(disabledServer.id);
      expect(connected).toBe(false);
    });

    it('should fail to connect to a non-existent server', async () => {
      const connected = await client.connect('non-existent');
      expect(connected).toBe(false);
    });
  });

  describe('Search Functionality', () => {
    it('should search across enabled servers', async () => {
      client.addServer(mockServer);
      
      // Mock successful connection
      const mockConnect = jest.spyOn(client, 'connect').mockResolvedValue(true);
      
      const results = await client.search('test query');
      
      // Should have attempted to connect
      expect(mockConnect).toHaveBeenCalled();
      
      // Should return results from mock
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'test-resource',
        content: 'Test resource description',
        url: 'http://example.com/resource',
        type: 'document',
        source: 'jira',
        serverName: 'Test Server'
      });
    });

    it('should handle search with options', async () => {
      client.addServer(mockServer);
      
      // Mock successful connection
      const mockConnect = jest.spyOn(client, 'connect').mockResolvedValue(true);
      
      const results = await client.search('test', { limit: 5, offset: 0 });
      
      expect(mockConnect).toHaveBeenCalled();
      expect(results).toHaveLength(1);
    });

    it('should return empty results when no servers are enabled', async () => {
      const results = await client.search('test query');
      expect(results).toHaveLength(0);
    });
  });

  describe('Status and Capabilities', () => {
    it('should get connection status for all servers', async () => {
      client.addServer(mockServer);
      
      const statuses = await client.getConnectionStatus();
      
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({
        serverId: mockServer.id,
        connected: expect.any(Boolean),
        lastChecked: expect.any(String)
      });
    });

    it('should get capabilities for a connected server', async () => {
      client.addServer(mockServer);
      await client.connect(mockServer.id);
      
      const capabilities = await client.getCapabilities(mockServer.id);
      
      expect(capabilities).toMatchObject({
        search: true,
        resources: true,
        tools: false,
        prompts: false
      });
    });

    it('should handle capabilities for non-existent server', async () => {
      const capabilities = await client.getCapabilities('non-existent');
      
      expect(capabilities).toMatchObject({
        search: false,
        resources: false,
        tools: false,
        prompts: false
      });
    });
  });

  describe('Type Inference', () => {
    it('should infer type from mime type', () => {
      const testCases = [
        { mimeType: 'text/plain', expected: 'document' },
        { mimeType: 'image/png', expected: 'image' },
        { mimeType: 'application/json', expected: 'data' },
        { mimeType: 'text/html', expected: 'webpage' },
        { mimeType: undefined, expected: 'resource' }
      ];

      testCases.forEach(({ mimeType, expected }) => {
        // Access private method for testing
        const inferType = (client as { inferTypeFromMimeType: (mimeType?: string) => string }).inferTypeFromMimeType;
        expect(inferType(mimeType)).toBe(expected);
      });
    });
  });

  describe('Cleanup', () => {
    it('should disconnect all clients on cleanup', () => {
      client.addServer(mockServer);
      client.disconnect();
      
      // Should not throw any errors
      expect(() => client.disconnect()).not.toThrow();
    });
  });
});