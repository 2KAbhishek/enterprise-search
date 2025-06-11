'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { MCPManager } from '@/lib/mcp/manager';
import { MCPServerConfig } from '@/types/mcp';
import { AggregatedSearchResult, SearchStatus } from '@/types/search';

export default function Home() {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [searchResults, setSearchResults] = useState<AggregatedSearchResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>([]);
  const [mcpManager, setMcpManager] = useState<MCPManager | null>(null);

  // Initialize MCP Manager
  useEffect(() => {
    const manager = MCPManager.getInstance();
    setMcpManager(manager);
    setMcpServers(manager.getServers());

    // Cleanup on unmount
    return () => {
      manager.disconnect();
    };
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!mcpManager) return;

    setSearchStatus('searching');
    setSearchResults(null);

    try {
      const results = await mcpManager.search(query, {
        limit: 20,
        timeout: 10000
      });
      
      setSearchResults(results);
      setSearchStatus('completed');
    } catch (error) {
      console.error('Search failed:', error);
      setSearchStatus('error');
      setSearchResults({
        results: [],
        totalCount: 0,
        searchTime: 0,
        sources: {}
      });
    }
  }, [mcpManager]);

  const handleSaveServers = useCallback((servers: MCPServerConfig[]) => {
    if (!mcpManager) return;

    // Update each server in the manager
    const currentServers = mcpManager.getServers();
    const currentIds = new Set(currentServers.map(s => s.id));
    const newIds = new Set(servers.map(s => s.id));

    // Remove deleted servers
    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        mcpManager.removeServer(id);
      }
    });

    // Add or update servers
    servers.forEach(server => {
      if (currentIds.has(server.id)) {
        mcpManager.updateServer(server);
      } else {
        mcpManager.addServer(server);
      }
    });

    setMcpServers(servers);
  }, [mcpManager]);

  const isSearching = searchStatus === 'searching';
  const hasServers = mcpServers.length > 0;
  const enabledServers = mcpServers.filter(s => s.enabled);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Search Across Your Enterprise
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unified search powered by Model Context Protocol. 
            Connect to Jira, Confluence, GitHub, Slack, Bitbucket and more.
          </p>
        </div>

        {/* Server Status */}
        {hasServers && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
              <span className={`w-2 h-2 rounded-full ${
                enabledServers.length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span>
                {enabledServers.length} of {mcpServers.length} servers enabled
              </span>
            </div>
          </div>
        )}

        {/* Search Interface */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            isSearching={isSearching}
            placeholder={
              enabledServers.length > 0 
                ? `Search across ${enabledServers.map(s => s.name).join(', ')}...`
                : "Configure MCP servers to start searching..."
            }
          />
        </div>

        {/* No Servers Warning */}
        {!hasServers && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">⚙️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No MCP Servers Configured
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first MCP server connection. 
                Connect to Jira, Confluence, GitHub, Slack, or any custom MCP server.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Configure Servers
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasServers && (
          <SearchResults 
            results={searchResults} 
            isSearching={isSearching}
          />
        )}

        {/* Error State */}
        {searchStatus === 'error' && (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">
              Search failed
            </div>
            <p className="text-gray-600">
              Please check your MCP server configurations and try again.
            </p>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        servers={mcpServers}
        onSave={handleSaveServers}
      />
    </div>
  );
}