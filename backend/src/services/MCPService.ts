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
  private retryAttempts: Map<string, number> = new Map();
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configPath = process.env.MCP_CONFIG_PATH || path.join(process.cwd(), '..', 'mcp-servers.json');
      
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
      await this.connectToServerWithRetry(serverConfig);
    }
  }

  private async connectToServerWithRetry(config: MCPServerConfig): Promise<void> {
    const attemptCount = this.retryAttempts.get(config.name) || 0;
    
    try {
      await this.connectToServer(config);
      this.retryAttempts.set(config.name, 0);
    } catch (error) {
      console.error(`Failed to connect to MCP server ${config.name} (attempt ${attemptCount + 1}):`, error);
      
      if (attemptCount < this.maxRetries) {
        this.retryAttempts.set(config.name, attemptCount + 1);
        console.log(`Retrying connection to ${config.name} in ${this.retryDelay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connectToServerWithRetry(config);
      } else {
        console.error(`Max retry attempts (${this.maxRetries}) reached for ${config.name}. Giving up.`);
        this.retryAttempts.set(config.name, 0);
      }
    }
  }

  private async connectToServer(config: MCPServerConfig): Promise<void> {
    try {
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: { 
          ...Object.fromEntries(
            Object.entries(process.env).filter(([, value]) => value !== undefined)
          ) as Record<string, string>,
          ...config.env 
        },
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
        // First, check what capabilities this server has
        const capabilities = await this.getServerCapabilities(client, serverName);
        results.push(`\n**${serverName} Capabilities:**`);
        results.push(capabilities);

        // Try to get tools for all servers
        try {
          const tools = await client.listTools();
          if (tools.tools && tools.tools.length > 0) {
            results.push(`\n**${serverName} Available Tools:**`);
            tools.tools.slice(0, 10).forEach(tool => {
              results.push(`- ${tool.name}: ${tool.description || 'No description'}`);
            });
          }
        } catch (toolError) {
          console.warn(`${serverName} tools not available:`, toolError);
        }

        // Try to get resources for all servers (some may not support this)
        try {
          const resources = await client.listResources();
          if (resources.resources && resources.resources.length > 0) {
            results.push(`\n**${serverName} Resources:**`);
            resources.resources.slice(0, 5).forEach(resource => {
              results.push(`- ${resource.name}: ${resource.description || 'No description'}`);
            });
          }
        } catch (resourceError) {
          console.warn(`${serverName} resources not available:`, resourceError);
        }

      } catch (error) {
        console.error(`Error querying ${serverName}:`, error);
        results.push(`\n**${serverName}:** Error retrieving data - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results.length > 0 
      ? results.join('\n')
      : 'No relevant information found in connected MCP servers.';
  }

  private async getServerCapabilities(client: Client, serverName: string): Promise<string> {
    const capabilities: string[] = [];
    
    try {
      // Check for tools capability
      try {
        await client.listTools();
        capabilities.push('Tools');
      } catch {
        // Tools not supported
      }

      // Check for resources capability
      try {
        await client.listResources();
        capabilities.push('Resources');
      } catch {
        // Resources not supported
      }

      // Check for prompts capability
      try {
        await client.listPrompts();
        capabilities.push('Prompts');
      } catch {
        // Prompts not supported
      }

      return capabilities.length > 0 ? capabilities.join(', ') : 'Connected (capabilities unknown)';
    } catch (error) {
      return `Error checking capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
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

  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP server '${serverName}' not connected`);
    }

    try {
      const result = await client.callTool({ name: toolName, arguments: args });
      return result;
    } catch (error) {
      console.error(`Error calling tool ${toolName} on ${serverName}:`, error);
      throw error;
    }
  }

  async getAvailableTools(serverName?: string): Promise<any> {
    if (serverName) {
      const client = this.clients.get(serverName);
      if (!client) {
        throw new Error(`MCP server '${serverName}' not connected`);
      }
      return await client.listTools();
    }

    const allTools: any = {};
    for (const [name, client] of this.clients) {
      try {
        const tools = await client.listTools();
        allTools[name] = tools;
      } catch (error) {
        console.warn(`Could not get tools for ${name}:`, error);
        allTools[name] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    return allTools;
  }
}