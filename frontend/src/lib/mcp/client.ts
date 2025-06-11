import { 
  MCPServerConfig, 
  MCPSearchResult,
  MCPConnectionStatus,
  MCPCapabilities 
} from '@/types/mcp';

export class MCPClient {
  private servers: Map<string, MCPServerConfig> = new Map();
  private bridgeClients: Map<string, string> = new Map();

  constructor() {
    this.loadServerConfigs();
  }

  private loadServerConfigs(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mcp-servers');
      if (stored) {
        try {
          const configs: MCPServerConfig[] = JSON.parse(stored);
          configs.forEach(config => {
            this.servers.set(config.id, config);
          });
        } catch (error) {
          console.error('Failed to load MCP server configs:', error);
        }
      }
    }
  }

  private saveServerConfigs(): void {
    if (typeof window !== 'undefined') {
      const configs = Array.from(this.servers.values());
      localStorage.setItem('mcp-servers', JSON.stringify(configs));
    }
  }

  addServer(config: MCPServerConfig): void {
    this.servers.set(config.id, config);
    this.saveServerConfigs();
  }

  removeServer(serverId: string): void {
    this.servers.delete(serverId);
    this.closeConnection(serverId);
    this.saveServerConfigs();
  }

  updateServer(config: MCPServerConfig): void {
    this.servers.set(config.id, config);
    this.saveServerConfigs();
    
    if (this.clients.has(config.id)) {
      this.closeConnection(config.id);
      if (config.enabled) {
        this.connect(config.id);
      }
    }
  }

  getServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  getEnabledServers(): MCPServerConfig[] {
    return Array.from(this.servers.values()).filter(server => server.enabled);
  }

  async connect(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server || !server.enabled) {
      return false;
    }

    try {
      const connectPayload: any = {};
      
      if (server.auth?.token) {
        connectPayload.config = {
          GITHUB_PERSONAL_ACCESS_TOKEN: server.auth.token
        };
      }

      const response = await fetch(`${server.endpoint}/mcp/${server.type}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.clientId) {
        this.bridgeClients.set(serverId, result.clientId);
        return true;
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error(`Failed to connect to MCP server ${serverId}:`, error);
      return false;
    }
  }

  async closeConnection(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    const clientId = this.bridgeClients.get(serverId);

    if (server && clientId) {
      try {
        await fetch(`${server.endpoint}/mcp/${clientId}/disconnect`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error(`Failed to disconnect from server ${serverId}:`, error);
      }
      this.bridgeClients.delete(serverId);
    }
  }

  async search(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<MCPSearchResult[]> {
    const enabledServers = this.getEnabledServers();
    const searchPromises = enabledServers.map(async (server) => {
      try {
        let clientId = this.bridgeClients.get(server.id);
        if (!clientId) {
          const connected = await this.connect(server.id);
          if (!connected) {
            throw new Error('Failed to connect to server');
          }
          clientId = this.bridgeClients.get(server.id);
        }

        if (!clientId) {
          throw new Error('Client ID not available after connection');
        }

        const response = await fetch(`${server.endpoint}/mcp/${clientId}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: options?.limit || 10,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return this.convertResourcesToSearchResults(result.resources || [], server, options?.limit);
        
      } catch (error) {
        console.error(`Search failed for server ${server.name}:`, error);
        return [];
      }
    });

    const allResults = await Promise.all(searchPromises);
    return allResults.flat();
  }

  private convertResourcesToSearchResults(
    resources: Array<{ name: string; description?: string; uri: string; mimeType?: string }>,
    server: MCPServerConfig,
    limit?: number
  ): MCPSearchResult[] {
    const results = resources.map((resource, index) => ({
      id: `${server.id}-${index}`,
      title: resource.name,
      content: resource.description || '',
      url: resource.uri,
      type: this.inferTypeFromMimeType(resource.mimeType),
      source: server.type,
      serverName: server.name,
      author: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      metadata: {
        mimeType: resource.mimeType,
        resourceUri: resource.uri
      },
      relevanceScore: 0
    }));

    return limit ? results.slice(0, limit) : results;
  }

  private inferTypeFromMimeType(mimeType?: string): string {
    if (!mimeType) return 'resource';
    
    if (mimeType.startsWith('text/')) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('application/json')) return 'data';
    if (mimeType.includes('html')) return 'webpage';
    
    return 'resource';
  }

  async getConnectionStatus(): Promise<MCPConnectionStatus[]> {
    const servers = this.getServers();
    const statusPromises = servers.map(async (server) => {
      let connected = false;
      let error: string | undefined;

      try {
        const clientId = this.bridgeClients.get(server.id);
        if (clientId) {
          const response = await fetch(`${server.endpoint}/mcp/${clientId}/resources`);
          connected = response.ok;
        } else {
          connected = await this.connect(server.id);
        }
      } catch (err) {
        error = String(err);
      }

      return {
        serverId: server.id,
        connected,
        lastChecked: new Date().toISOString(),
        error
      };
    });

    return Promise.all(statusPromises);
  }

  async getCapabilities(serverId: string): Promise<MCPCapabilities> {
    try {
      const clientId = this.bridgeClients.get(serverId);
      const server = this.servers.get(serverId);
      
      if (!clientId || !server) {
        throw new Error(`No client found for server ${serverId}`);
      }

      const [resourcesResponse, toolsResponse] = await Promise.allSettled([
        fetch(`${server.endpoint}/mcp/${clientId}/resources`),
        fetch(`${server.endpoint}/mcp/${clientId}/tools`)
      ]);

      return {
        search: true,
        resources: resourcesResponse.status === 'fulfilled' && resourcesResponse.value.ok,
        tools: toolsResponse.status === 'fulfilled' && toolsResponse.value.ok,
        prompts: false
      };
    } catch (error) {
      console.error(`Failed to get capabilities for server ${serverId}:`, error);
      return {
        search: false,
        resources: false,
        tools: false,
        prompts: false
      };
    }
  }

  async disconnect(): Promise<void> {
    const disconnectPromises = Array.from(this.bridgeClients.keys()).map(serverId => 
      this.closeConnection(serverId)
    );
    await Promise.all(disconnectPromises);
  }
}