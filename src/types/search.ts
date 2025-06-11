import { MCPSearchResult, MCPServerType } from './mcp';

export interface SearchQuery {
  query: string;
  timestamp: string;
  filters?: SearchFilters;
}

export interface SearchFilters {
  sources?: MCPServerType[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  type?: string[];
  author?: string[];
}

export interface AggregatedSearchResult {
  results: MCPSearchResult[];
  totalCount: number;
  searchTime: number;
  sources: {
    [serverName: string]: {
      count: number;
      status: 'success' | 'error' | 'timeout';
      error?: string;
    };
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  searchTime: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  createdAt: string;
  updatedAt: string;
}

export interface SearchStats {
  totalSearches: number;
  averageSearchTime: number;
  popularQueries: Array<{
    query: string;
    count: number;
  }>;
  sourceUsage: Array<{
    source: MCPServerType;
    count: number;
  }>;
}

export type SearchStatus = 'idle' | 'searching' | 'completed' | 'error';

export interface SearchState {
  status: SearchStatus;
  query: string;
  results: AggregatedSearchResult | null;
  error: string | null;
  history: SearchHistory[];
  savedSearches: SavedSearch[];
}