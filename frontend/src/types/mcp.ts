export interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  type: MCPServerType;
  enabled: boolean;
  auth?: MCPAuth;
  metadata?: Record<string, unknown>;
}

export type MCPServerType = 
  | 'jira' 
  | 'confluence' 
  | 'github' 
  | 'slack' 
  | 'bitbucket' 
  | 'custom';

export interface MCPAuth {
  type: 'bearer' | 'token' | 'basic' | 'oauth';
  token?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export interface MCPSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
  filters?: MCPSearchFilters;
}

export interface MCPSearchFilters {
  type?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  author?: string[];
  project?: string[];
  tags?: string[];
}

export interface MCPSearchResult {
  id: string;
  title: string;
  content: string;
  url: string;
  type: string;
  source: MCPServerType;
  serverName: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  relevanceScore?: number;
}

export interface MCPConnectionStatus {
  serverId: string;
  connected: boolean;
  lastChecked: string;
  error?: string;
}

export interface MCPCapabilities {
  search: boolean;
  resources: boolean;
  tools: boolean;
  prompts: boolean;
}