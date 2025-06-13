'use client';

import React from 'react';
import { GearIcon } from '@radix-ui/react-icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onServersClick: () => void;
}

export function Header({ onServersClick }: HeaderProps) {
  const { colors } = useTheme();
  
  const headerStyle = {
    backgroundColor: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease'
  };

  const titleStyle = {
    color: colors.foreground
  };

  const badgeStyle = {
    backgroundColor: colors.secondary,
    color: colors.mutedForeground
  };

  const buttonStyle = {
    color: colors.secondaryForeground,
    backgroundColor: colors.secondary,
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <header style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold" style={titleStyle}>
              🔍 Enterprise Search
            </h1>
            <span 
              className="text-sm px-2 py-1 rounded"
              style={badgeStyle}
            >
              MCP Powered
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={onServersClick}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.muted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              title="MCP Servers"
            >
              <GearIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}