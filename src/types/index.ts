export * from './mcp';
export * from './search';

export interface AppConfig {
  maxSearchResults: number;
  searchTimeout: number;
  enableSearchHistory: boolean;
  enableAnalytics: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultSources: string[];
  searchResultsPerPage: number;
  enableNotifications: boolean;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}