'use client';

import React from 'react';
import { MCPSearchResult } from '@/types/mcp';
import { AggregatedSearchResult } from '@/types/search';
import { ExternalLinkIcon, ClockIcon, PersonIcon } from '@radix-ui/react-icons';

interface SearchResultsProps {
  results: AggregatedSearchResult | null;
  isSearching: boolean;
}

export function SearchResults({ results, isSearching }: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Searching across your enterprise systems...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Enter a search query to get started</div>
        <p className="text-gray-400">Search across Jira, Confluence, GitHub, Slack, Bitbucket and more</p>
      </div>
    );
  }

  if (results.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No results found</div>
        <p className="text-gray-400">Try adjusting your search terms or check your MCP server configurations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="text-sm text-gray-600">
          Found {results.totalCount} results in {results.searchTime}ms
        </div>
        <div className="flex space-x-4 text-xs text-gray-500">
          {Object.entries(results.sources).map(([source, info]) => (
            <span key={source} className="flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${
                info.status === 'success' ? 'bg-green-500' : 
                info.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
              <span>{source} ({info.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      issue: 'bg-blue-100 text-blue-800',
      page: 'bg-green-100 text-green-800',
      pull_request: 'bg-purple-100 text-purple-800',
      message: 'bg-yellow-100 text-yellow-800',
      repository: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getSourceIcon(result.source)}</span>
          <span className="font-medium text-gray-900">{result.serverName}</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}`}>
            {result.type}
          </span>
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <ExternalLinkIcon className="h-4 w-4" />
        </a>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {result.title}
      </h3>

      <p className="text-gray-600 mb-3 line-clamp-3">
        {result.content}
      </p>

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        {result.author && (
          <div className="flex items-center space-x-1">
            <PersonIcon className="h-3 w-3" />
            <span>{result.author}</span>
          </div>
        )}
        
        {result.updatedAt && (
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-3 w-3" />
            <span>Updated {formatDate(result.updatedAt)}</span>
          </div>
        )}

        {typeof result.metadata?.project === 'string' && (
          <div className="flex items-center space-x-1">
            <span>📁</span>
            <span>{result.metadata.project}</span>
          </div>
        )}

        {result.relevanceScore && result.relevanceScore > 0 && (
          <div className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">
            Score: {Math.round(result.relevanceScore)}
          </div>
        )}
      </div>
    </div>
  );
}