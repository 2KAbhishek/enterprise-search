'use client';

import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, isSearching = false, placeholder = "Search across all your enterprise systems..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const { colors } = useTheme();

  const spinnerStyle = {
    width: '1rem',
    height: '1rem',
    border: `2px solid ${colors.primaryForeground}`,
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

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
    <div style={{ width: '100%', maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MagnifyingGlassIcon 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              height: '1.25rem', 
              width: '1.25rem', 
              color: colors.mutedForeground 
            }} 
          />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSearching}
            style={{
              width: '100%',
              paddingLeft: '3rem',
              paddingRight: '1rem',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontSize: '1.125rem',
              lineHeight: '1.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              backgroundColor: colors.input,
              color: colors.foreground,
              transition: 'all 0.2s ease',
              outline: 'none',
              opacity: isSearching ? 0.5 : 1,
              cursor: isSearching ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.ring;
              e.target.style.boxShadow = `0 0 0 2px ${colors.ring}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }}
          />

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            style={{
              position: 'absolute',
              right: '0.5rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              backgroundColor: colors.primary,
              color: colors.primaryForeground,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: (!query.trim() || isSearching) ? 'not-allowed' : 'pointer',
              opacity: (!query.trim() || isSearching) ? 0.5 : 1,
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!(!query.trim() || isSearching)) {
                e.currentTarget.style.filter = 'brightness(0.9)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.ring}40`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isSearching ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={spinnerStyle}></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {isSearching && (
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.875rem', 
          lineHeight: '1.25rem', 
          color: colors.mutedForeground, 
          textAlign: 'center' 
        }}>
          Searching across your configured MCP servers...
        </div>
      )}
    </div>
  );
}