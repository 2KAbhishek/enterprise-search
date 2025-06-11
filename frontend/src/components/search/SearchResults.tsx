'use client';

import React from 'react';
import { MCPSearchResult } from '@/types/mcp';
import { AggregatedSearchResult } from '@/types/search';
import { ExternalLinkIcon, ClockIcon, PersonIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/contexts/ThemeContext';

const spinKeyframes = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('search-results-styles')) {
  const style = document.createElement('style');
  style.id = 'search-results-styles';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

interface SearchResultsProps {
  results: AggregatedSearchResult | null;
  isSearching: boolean;
}

export function SearchResults({ results, isSearching }: SearchResultsProps) {
  const { colors } = useTheme();

  if (isSearching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div 
            data-testid="loading-spinner"
            style={{
              width: '2rem',
              height: '2rem',
              border: `4px solid ${colors.primary}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}
          ></div>
          <p style={{ color: colors.mutedForeground }}>Searching across your enterprise systems...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ color: colors.mutedForeground, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Enter a search query to get started</div>
        <p style={{ color: colors.mutedForeground, opacity: 0.7 }}>Search across Jira, Confluence, GitHub, Slack, Bitbucket and more</p>
      </div>
    );
  }

  if (results.results.length === 0) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ color: colors.mutedForeground, fontSize: '1.125rem', marginBottom: '0.5rem' }}>No results found</div>
        <p style={{ color: colors.mutedForeground, opacity: 0.7 }}>Try adjusting your search terms or check your MCP server configurations</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.875rem', color: colors.mutedForeground }}>
          Found {results.totalCount} results in {results.searchTime}ms
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: colors.mutedForeground }}>
          {Object.entries(results.sources).map(([source, info]) => (
            <span key={source} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: info.status === 'success' ? '#10b981' : 
                               info.status === 'error' ? '#ef4444' : '#f59e0b'
              }}></span>
              <span>{source} ({info.count})</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.results.map((result) => (
          <SearchResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  result: MCPSearchResult;
}

function SearchResultCard({ result }: SearchResultCardProps) {
  const { colors } = useTheme();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      jira: '🎯',
      confluence: '📚',
      github: '🐙',
      slack: '💬',
      bitbucket: '🪣',
    };
    return icons[source] || '📄';
  };

  const getTypeStyle = (type: string): React.CSSProperties => {
    const typeStyles: Record<string, React.CSSProperties> = {
      issue: { backgroundColor: '#dbeafe', color: '#1e40af' },
      page: { backgroundColor: '#d1fae5', color: '#065f46' },
      pull_request: { backgroundColor: '#e9d5ff', color: '#6b21a8' },
      message: { backgroundColor: '#fef3c7', color: '#92400e' },
      repository: { backgroundColor: colors.muted, color: colors.mutedForeground },
    };
    return typeStyles[type] || { backgroundColor: colors.muted, color: colors.mutedForeground };
  };

  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.card,
      borderRadius: '0.5rem',
      padding: '1rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      transition: 'box-shadow 0.2s ease',
      cursor: 'pointer'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.125rem' }}>{getSourceIcon(result.source)}</span>
          <span style={{ fontWeight: '500', color: colors.cardForeground }}>{result.serverName}</span>
          <span style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: '9999px',
            ...getTypeStyle(result.type)
          }}>
            {result.type}
          </span>
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: colors.primary,
            textDecoration: 'none',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <ExternalLinkIcon style={{ height: '1rem', width: '1rem' }} />
        </a>
      </div>

      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: colors.cardForeground,
        marginBottom: '0.5rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {result.title}
      </h3>

      <p style={{
        color: colors.mutedForeground,
        marginBottom: '0.75rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {result.content}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: colors.mutedForeground }}>
        {result.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <PersonIcon style={{ height: '0.75rem', width: '0.75rem' }} />
            <span>{result.author}</span>
          </div>
        )}
        
        {result.updatedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ClockIcon style={{ height: '0.75rem', width: '0.75rem' }} />
            <span>Updated {formatDate(result.updatedAt)}</span>
          </div>
        )}

        {typeof result.metadata?.project === 'string' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>📁</span>
            <span>{result.metadata.project}</span>
          </div>
        )}

        {result.relevanceScore && result.relevanceScore > 0 && (
          <div style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            backgroundColor: colors.muted,
            color: colors.mutedForeground,
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem'
          }}>
            Score: {Math.round(result.relevanceScore)}
          </div>
        )}
      </div>
    </div>
  );
}