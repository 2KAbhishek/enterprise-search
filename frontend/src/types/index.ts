export interface AppConfig {
    maxChatHistory: number;
    requestTimeout: number;
    enableChatHistory: boolean;
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
    enableNotifications: boolean;
}

export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}
