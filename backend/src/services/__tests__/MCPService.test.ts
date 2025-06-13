import { MCPService } from '../MCPService';
import * as fs from 'fs';
import * as path from 'path';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn(),
}));

// Mock fs module
jest.mock('fs');
jest.mock('path');

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('MCPService', () => {
  let mcpService: MCPService;
  let mockClient: jest.Mocked<Client>;
  let mockTransport: jest.Mocked<StdioClientTransport>;

  const mockConfig = {
    servers: [
      {
        name: 'GitHub',
        command: 'npx',
        args: ['@modelcontextprotocol/server-github'],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'test-token' },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fs methods
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));
    (path.join as jest.Mock).mockReturnValue('/mock/path/mcp-servers.json');

    // Mock MCP SDK classes
    mockClient = {
      connect: jest.fn(),
      close: jest.fn(),
      listResources: jest.fn(),
      listTools: jest.fn(),
      listPrompts: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    mockTransport = {
      close: jest.fn(),
    } as unknown as jest.Mocked<StdioClientTransport>;

    (Client as jest.Mock).mockImplementation(() => mockClient);
    (StdioClientTransport as jest.Mock).mockImplementation(() => mockTransport);

    mcpService = new MCPService();
  });

  describe('constructor', () => {
    it('should load config successfully', () => {
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should handle missing config file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const service = new MCPService();
      expect(service.getConnectedServers()).toEqual([]);
    });

    it('should handle config parse errors', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');
      
      const service = new MCPService();
      expect(service.getConnectedServers()).toEqual([]);
    });
  });

  describe('connectToServers', () => {
    it('should connect to all configured servers', async () => {
      mockClient.connect.mockResolvedValue(undefined);

      await mcpService.connectToServers();

      expect(Client).toHaveBeenCalledWith(
        { name: 'enterprise-search-client', version: '1.0.0' },
        { capabilities: { resources: {}, tools: {}, prompts: {} } }
      );
      expect(mockClient.connect).toHaveBeenCalledWith(mockTransport);
      expect(mcpService.getConnectedServers()).toContain('GitHub');
    });

    it('should handle connection failures gracefully', async () => {
      mockClient.connect.mockRejectedValue(new Error('Connection failed'));

      await mcpService.connectToServers();

      expect(mcpService.getConnectedServers()).toEqual([]);
    }, 10000);

    it('should warn when no servers configured', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ servers: [] }));
      const service = new MCPService();

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await service.connectToServers();

      expect(consoleSpy).toHaveBeenCalledWith('No MCP servers configured');
      consoleSpy.mockRestore();
    });
  });

  describe('queryAllServers', () => {
    beforeEach(async () => {
      mockClient.connect.mockResolvedValue(undefined);
      await mcpService.connectToServers();
    });

    it('should query all connected servers and return formatted results', async () => {
      const mockResources = {
        resources: [
          {
            name: 'enterprise-search',
            description: 'Main project repository',
            uri: 'github://repo/enterprise-search',
          },
          {
            name: 'web-toolkit',
            description: 'Utility library',
            uri: 'github://repo/web-toolkit',
          },
        ],
      };

      mockClient.listResources.mockResolvedValue(mockResources);
      mockClient.listTools = jest.fn().mockResolvedValue({ tools: [] });
      mockClient.listPrompts = jest.fn().mockResolvedValue({ prompts: [] });

      const result = await mcpService.queryAllServers('enterprise');

      expect(mockClient.listResources).toHaveBeenCalled();
      expect(result).toContain('**GitHub Capabilities:**');
      expect(result).toContain('enterprise-search: Main project repository');
    });

    it('should handle servers with no matching resources', async () => {
      mockClient.listResources.mockResolvedValue({ resources: [] });
      mockClient.listTools = jest.fn().mockResolvedValue({ tools: [] });
      mockClient.listPrompts = jest.fn().mockResolvedValue({ prompts: [] });

      const result = await mcpService.queryAllServers('nonexistent');

      expect(result).toContain('**GitHub Capabilities:**');
      expect(result).toContain('Resources');
    });

    it('should handle server query errors', async () => {
      // Simulate that the capabilities check works, but later operations fail
      mockClient.listTools = jest.fn().mockResolvedValue({ tools: [] });
      mockClient.listResources.mockRejectedValue(new Error('Query failed'));
      mockClient.listPrompts = jest.fn().mockResolvedValue({ prompts: [] });

      const result = await mcpService.queryAllServers('test');

      expect(result).toContain('**GitHub Capabilities:**');
      expect(result).toContain('Tools');
    });

    it('should return message when no servers connected', async () => {
      const service = new MCPService();
      const result = await service.queryAllServers('test');

      expect(result).toBe('No MCP servers are currently connected.');
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      mockClient.connect.mockResolvedValue(undefined);
      await mcpService.connectToServers();
    });

    it('should disconnect all clients and transports', async () => {
      mockClient.close.mockResolvedValue(undefined);

      await mcpService.disconnect();

      expect(mockClient.close).toHaveBeenCalled();
      expect(mockTransport.close).toHaveBeenCalled();
      expect(mcpService.getConnectedServers()).toEqual([]);
    });

    it('should handle disconnect errors gracefully', async () => {
      mockClient.close.mockRejectedValue(new Error('Disconnect failed'));

      await expect(mcpService.disconnect()).resolves.not.toThrow();
      expect(mcpService.getConnectedServers()).toEqual([]);
    });
  });
});