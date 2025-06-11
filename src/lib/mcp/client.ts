import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { 
  MCPServerConfig, 
  MCPSearchResult,
  MCPConnectionStatus,
  MCPCapabilities 
} from '@/types/mcp';

export class MCPClient {
  private servers: Map<string, MCPServerConfig> = new Map();
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StdioClientTransport | SSEClientTransport> = new Map();

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
    
    // Reconnect if the server was already connected
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
      // Create appropriate transport based on server endpoint
      let transport: StdioClientTransport | SSEClientTransport;
      
      if (server.endpoint.startsWith('http')) {
        // Use SSE transport for HTTP endpoints
        transport = new SSEClientTransport(new URL(server.endpoint));
      } else {
        // Use stdio for local/command-line servers - requires command and args
        // For now, we'll default to SSE for non-HTTP endpoints
        transport = new SSEClientTransport(new URL(server.endpoint));
      }

      // Create client
      const client = new Client({
        name: `enterprise-search-client`,
        version: '1.0.0'
      }, {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
          experimental: {}
        }
      });

      // Connect to server
      await client.connect(transport);

      this.clients.set(serverId, client);
      this.transports.set(serverId, transport);

      return true;
    } catch (error) {
      console.error(`Failed to connect to MCP server ${serverId}:`, error);
      return false;
    }
  }

  closeConnection(serverId: string): void {
    const client = this.clients.get(serverId);
    const transport = this.transports.get(serverId);

    if (client) {
      client.close();
      this.clients.delete(serverId);
    }

    if (transport) {
      transport.close();
      this.transports.delete(serverId);
    }
  }

  async search(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<MCPSearchResult[]> {
    const enabledServers = this.getEnabledServers();
    const searchPromises = enabledServers.map(async (server) => {
      try {
        const client = this.clients.get(server.id);
        if (!client) {
          // Try to connect if not already connected
          const connected = await this.connect(server.id);
          if (!connected) {
            throw new Error('Failed to connect to server');
          }
        }

        const connectedClient = this.clients.get(server.id);
        if (!connectedClient) {
          throw new Error('Client not available after connection');
        }

        // Use the resources/list method to search for resources
        const response = await connectedClient.listResources();
        
        // Filter resources based on query
        const filteredResources = response.resources.filter(resource => 
          resource.name.toLowerCase().includes(query.toLowerCase()) ||
          (resource.description && resource.description.toLowerCase().includes(query.toLowerCase()))
        );

        // Convert to our search result format
        return this.convertResourcesToSearchResults(filteredResources, server, options?.limit);
        
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
        const client = this.clients.get(server.id);
        if (client) {
          // Test connection by listing resources
          await client.listResources();
          connected = true;
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
      const client = this.clients.get(serverId);
      if (!client) {
        throw new Error(`No client found for server ${serverId}`);
      }

      // The client capabilities are established during connection
      // For now, we'll assume basic capabilities
      return {
        search: true,
        resources: true,
        tools: false,
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

  disconnect(): void {
    this.clients.forEach((client, serverId) => {
      this.closeConnection(serverId);
    });
  }
}