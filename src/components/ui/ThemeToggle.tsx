'use client';

import React from 'react';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: colors.secondary,
        color: colors.secondaryForeground,
        border: 'none',
        borderRadius: '6px',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.muted;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.secondary;
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'dark' ? (
        <SunIcon style={{ width: '20px', height: '20px' }} />
      ) : (
        <MoonIcon style={{ width: '20px', height: '20px' }} />
      )}
    </button>
  );
}