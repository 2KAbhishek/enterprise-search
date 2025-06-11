import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as fs from 'fs';
import * as path from 'path';

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

interface MCPConfigFile {
  servers: MCPServerConfig[];
}

export class MCPService {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StdioClientTransport> = new Map();
  private config: MCPConfigFile | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(process.cwd(), '..', 'mcp-servers.json');
      
      if (!fs.existsSync(configPath)) {
        console.warn('MCP configuration file not found at:', configPath);
        this.config = { servers: [] };
        return;
      }

      const configData = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configData) as MCPConfigFile;
      console.log(`✅ Loaded MCP config with ${this.config.servers.length} servers`);
    } catch (error) {
      console.error('Failed to load MCP configuration:', error);
      this.config = { servers: [] };
    }
  }

  async connectToServers(): Promise<void> {
    if (!this.config?.servers.length) {
      console.warn('No MCP servers configured');
      return;
    }

    for (const serverConfig of this.config.servers) {
      try {
        await this.connectToServer(serverConfig);
      } catch (error) {
        console.error(`Failed to connect to MCP server ${serverConfig.name}:`, error);
      }
    }
  }

  private async connectToServer(config: MCPServerConfig): Promise<void> {
    try {
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: { ...process.env, ...config.env },
      });

      const client = new Client({
        name: 'enterprise-search-client',
        version: '1.0.0',
      }, {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      });

      await client.connect(transport);
      
      this.clients.set(config.name, client);
      this.transports.set(config.name, transport);
      
      console.log(`✅ Connected to MCP server: ${config.name}`);
    } catch (error) {
      console.error(`❌ Failed to connect to MCP server ${config.name}:`, error);
      throw error;
    }
  }

  async queryAllServers(query: string): Promise<string> {
    if (this.clients.size === 0) {
      return 'No MCP servers are currently connected.';
    }

    const results: string[] = [];

    for (const [serverName, client] of this.clients) {
      try {
        const resources = await client.listResources();
        
        const relevantResources = resources.resources.filter(resource =>
          resource.name.toLowerCase().includes(query.toLowerCase()) ||
          (resource.description && resource.description.toLowerCase().includes(query.toLowerCase()))
        );

        if (relevantResources.length > 0) {
          results.push(`\n**${serverName}:**`);
          relevantResources.forEach(resource => {
            results.push(`- ${resource.name}: ${resource.description || 'No description'}`);
          });
        }
      } catch (error) {
        console.error(`Error querying ${serverName}:`, error);
        results.push(`\n**${serverName}:** Error retrieving data`);
      }
    }

    return results.length > 0 
      ? results.join('\n')
      : 'No relevant information found in connected MCP servers.';
  }

  async disconnect(): Promise<void> {
    for (const [name, client] of this.clients) {
      try {
        await client.close();
        console.log(`Disconnected from ${name}`);
      } catch (error) {
        console.error(`Error disconnecting from ${name}:`, error);
      }
    }

    for (const [name, transport] of this.transports) {
      try {
        transport.close();
      } catch (error) {
        console.error(`Error closing transport for ${name}:`, error);
      }
    }

    this.clients.clear();
    this.transports.clear();
  }

  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }
}