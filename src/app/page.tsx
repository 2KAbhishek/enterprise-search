'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { MCPManager } from '@/lib/mcp/manager';
import { MCPServerConfig } from '@/types/mcp';
import { AggregatedSearchResult, SearchStatus } from '@/types/search';

export default function Home() {
  const { colors } = useTheme();
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'all 0.2s ease'
    }}>
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: colors.foreground,
            marginBottom: '1rem'
          }}>
            Search Across Your Enterprise
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: colors.mutedForeground,
            maxWidth: '42rem',
            margin: '0 auto'
          }}>
            Unified search powered by Model Context Protocol. 
            Connect to Jira, Confluence, GitHub, Slack, Bitbucket and more.
          </p>
        </div>

        {/* Server Status */}
        {hasServers && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: colors.mutedForeground,
              backgroundColor: colors.card,
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`
            }}>
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: enabledServers.length > 0 ? '#10b981' : '#ef4444'
              }}></span>
              <span>
                {enabledServers.length} of {mcpServers.length} servers enabled
              </span>
            </div>
          </div>
        )}

        {/* Search Interface */}
        <div style={{ marginBottom: '2rem' }}>
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
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
              <div style={{
                color: colors.mutedForeground,
                fontSize: '3.75rem',
                marginBottom: '1rem'
              }}>⚙️</div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: colors.foreground,
                marginBottom: '0.5rem'
              }}>
                No MCP Servers Configured
              </h3>
              <p style={{
                color: colors.mutedForeground,
                marginBottom: '1rem'
              }}>
                Get started by adding your first MCP server connection. 
                Connect to Jira, Confluence, GitHub, Slack, or any custom MCP server.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  backgroundColor: colors.primary,
                  color: colors.primaryForeground,
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
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
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              color: '#ef4444',
              fontSize: '1.125rem',
              marginBottom: '0.5rem'
            }}>
              Search failed
            </div>
            <p style={{
              color: colors.mutedForeground
            }}>
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