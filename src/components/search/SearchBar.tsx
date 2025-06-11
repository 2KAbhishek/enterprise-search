'use client';

import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, isSearching = false, placeholder = "Search across all your enterprise systems..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-gray-400" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSearching}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {isSearching && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          Searching across your configured MCP servers...
        </div>
      )}
    </div>
  );
}