import { MCPManager } from '../manager';
import { MCPClient } from '../client';
import { MCPServerConfig, MCPSearchResult } from '@/types/mcp';

// Mock the MCPClient
jest.mock('../client');

describe('MCPManager', () => {
  let manager: MCPManager;
  let mockClient: jest.Mocked<MCPClient>;
  let mockServer: MCPServerConfig;
  let mockSearchResults: MCPSearchResult[];

  beforeEach(() => {
    // Clear the singleton instance
    (MCPManager as { instance: MCPManager | undefined }).instance = undefined;
    
    mockClient = {
      search: jest.fn(),
      getServers: jest.fn(),
      getEnabledServers: jest.fn(),
      addServer: jest.fn(),
      updateServer: jest.fn(),
      removeServer: jest.fn(),
      connect: jest.fn(),
      getConnectionStatus: jest.fn(),
      disconnect: jest.fn()
    } as jest.Mocked<MCPClient>;

    (MCPClient as jest.Mock).mockImplementation(() => mockClient);

    manager = MCPManager.getInstance();
    
    mockServer = {
      id: 'test-server',
      name: 'Test Server',
      endpoint: 'http://localhost:3001',
      type: 'jira',
      enabled: true
    };

    mockSearchResults = [
      {
        id: 'result-1',
        title: 'Test Issue',
        content: 'This is a test issue content',
        url: 'http://example.com/issue/1',
        type: 'issue',
        source: 'jira',
        serverName: 'Test Server',
        relevanceScore: 0
      },
      {
        id: 'result-2',
        title: 'Another Test',
        content: 'Another test content',
        url: 'http://example.com/issue/2',
        type: 'issue',
        source: 'jira',
        serverName: 'Test Server',
        relevanceScore: 0
      }
    ];
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const manager1 = MCPManager.getInstance();
      const manager2 = MCPManager.getInstance();
      
      expect(manager1).toBe(manager2);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      mockClient.search.mockResolvedValue(mockSearchResults);
      mockClient.getEnabledServers.mockReturnValue([mockServer]);
    });

    it('should perform search and return aggregated results', async () => {
      const results = await manager.search('test query');
      
      expect(mockClient.search).toHaveBeenCalledWith('test query', { limit: 20 });
      expect(results).toMatchObject({
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 'result-1',
            title: 'Test Issue'
          })
        ]),
        totalCount: 2,
        searchTime: expect.any(Number),
        sources: {
          'Test Server': {
            count: 2,
            status: 'success'
          }
        }
      });
    });

    it('should handle search with custom options', async () => {
      await manager.search('test query', { 
        limit: 10, 
        timeout: 5000,
        sources: ['test-server'] 
      });
      
      expect(mockClient.search).toHaveBeenCalledWith('test query', { limit: 10 });
    });

    it('should handle search timeout', async () => {
      mockClient.search.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 15000))
      );
      
      const results = await manager.search('test query', { timeout: 100 });
      
      expect(results.totalCount).toBe(0);
      expect(results.sources['Test Server']?.status).toBe('error');
    });

    it('should handle search errors', async () => {
      mockClient.search.mockRejectedValue(new Error('Connection failed'));
      
      const results = await manager.search('test query');
      
      expect(results.totalCount).toBe(0);
      expect(results.sources['Test Server']?.status).toBe('error');
      expect(results.sources['Test Server']?.error).toBe('Connection failed');
    });
  });

  describe('Result Ranking', () => {
    beforeEach(() => {
      mockClient.getEnabledServers.mockReturnValue([mockServer]);
      mockClient.search.mockResolvedValue(mockSearchResults);
    });

    it('should rank results by relevance', async () => {
      const resultsWithDifferentRelevance = [
        {
          ...mockSearchResults[0],
          title: 'exact match',
          content: 'some content'
        },
        {
          ...mockSearchResults[1],
          title: 'partial test match',
          content: 'some content'
        }
      ];
      
      mockClient.search.mockResolvedValue(resultsWithDifferentRelevance);
      
      const results = await manager.search('exact match');
      
      // Should prioritize exact title matches
      expect(results.results[0].title).toBe('exact match');
      expect(results.results[0].relevanceScore).toBeGreaterThan(
        results.results[1].relevanceScore!
      );
    });

    it('should boost recent items', async () => {
      const recentDate = new Date().toISOString();
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days ago
      
      const resultsWithDates = [
        {
          ...mockSearchResults[0],
          updatedAt: oldDate,
          title: 'test'
        },
        {
          ...mockSearchResults[1],
          updatedAt: recentDate,
          title: 'test'
        }
      ];
      
      mockClient.search.mockResolvedValue(resultsWithDates);
      
      const results = await manager.search('test');
      
      // Recent item should be ranked higher
      expect(results.results[0].updatedAt).toBe(recentDate);
    });
  });

  describe('Server Management', () => {
    it('should delegate server operations to client', () => {
      manager.addServer(mockServer);
      expect(mockClient.addServer).toHaveBeenCalledWith(mockServer);
      
      manager.updateServer(mockServer);
      expect(mockClient.updateServer).toHaveBeenCalledWith(mockServer);
      
      manager.removeServer('test-id');
      expect(mockClient.removeServer).toHaveBeenCalledWith('test-id');
      
      manager.getServers();
      expect(mockClient.getServers).toHaveBeenCalled();
    });

    it('should test server connections', async () => {
      mockClient.connect.mockResolvedValue(true);
      
      const connected = await manager.testConnection('test-server');
      
      expect(mockClient.connect).toHaveBeenCalledWith('test-server');
      expect(connected).toBe(true);
    });

    it('should get connection statuses', async () => {
      const mockStatuses = [
        {
          serverId: 'test-server',
          connected: true,
          lastChecked: new Date().toISOString()
        }
      ];
      
      mockClient.getConnectionStatus.mockResolvedValue(mockStatuses);
      
      const statuses = await manager.getConnectionStatuses();
      
      expect(mockClient.getConnectionStatus).toHaveBeenCalled();
      expect(statuses).toEqual(mockStatuses);
    });
  });

  describe('Cleanup', () => {
    it('should disconnect client on cleanup', () => {
      manager.disconnect();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });
});