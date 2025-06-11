import { MCPClient } from './client';
import { MCPServerConfig, MCPSearchResult } from '@/types/mcp';
import { AggregatedSearchResult } from '@/types/search';

export class MCPManager {
  private client: MCPClient;
  private static instance: MCPManager;

  private constructor() {
    this.client = new MCPClient();
  }

  static getInstance(): MCPManager {
    if (!MCPManager.instance) {
      MCPManager.instance = new MCPManager();
    }
    return MCPManager.instance;
  }

  async search(query: string, options?: {
    limit?: number;
    timeout?: number;
    sources?: string[];
  }): Promise<AggregatedSearchResult> {
    const startTime = Date.now();

    try {
      const results = await Promise.race([
        this.client.search(query, {
          limit: options?.limit || 20
        }),
        new Promise<MCPSearchResult[]>((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), options?.timeout || 10000)
        )
      ]);

      const rankedResults = this.rankResults(results, query);
      const totalSearchTime = Date.now() - startTime;

      const sources: AggregatedSearchResult['sources'] = {};
      const enabledServers = this.client.getEnabledServers();
      
      enabledServers.forEach(server => {
        const serverResults = results.filter(r => r.serverName === server.name);
        sources[server.name] = {
          count: serverResults.length,
          status: 'success' as const
        };
      });

      return {
        results: rankedResults,
        totalCount: results.length,
        searchTime: totalSearchTime,
        sources
      };
    } catch (error) {
      const totalSearchTime = Date.now() - startTime;
      const enabledServers = this.client.getEnabledServers();
      
      const sources: AggregatedSearchResult['sources'] = {};
      enabledServers.forEach(server => {
        sources[server.name] = {
          count: 0,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      });

      return {
        results: [],
        totalCount: 0,
        searchTime: totalSearchTime,
        sources
      };
    }
  }

  private rankResults(results: MCPSearchResult[], query: string): MCPSearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);

    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevance(result, queryTerms)
      }))
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  private calculateRelevance(result: MCPSearchResult, queryTerms: string[]): number {
    let score = result.relevanceScore || 0;

    const title = result.title.toLowerCase();
    const content = result.content.toLowerCase();

    queryTerms.forEach(term => {
      if (title.includes(term)) {
        score += title === term ? 100 : 50;
      }
      if (content.includes(term)) {
        score += 10;
      }
    });

    if (result.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(result.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) {
        score += 5;
      }
    }

    return score;
  }

  getServers(): MCPServerConfig[] {
    return this.client.getServers();
  }

  addServer(config: MCPServerConfig): void {
    this.client.addServer(config);
  }

  updateServer(config: MCPServerConfig): void {
    this.client.updateServer(config);
  }

  removeServer(serverId: string): void {
    this.client.removeServer(serverId);
  }

  async testConnection(serverId: string): Promise<boolean> {
    return this.client.connect(serverId);
  }

  async getConnectionStatuses() {
    return this.client.getConnectionStatus();
  }

  disconnect(): void {
    this.client.disconnect();
  }
}