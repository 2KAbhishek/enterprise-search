'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { colors } = useTheme();

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const containerStyle = {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'transparent',
  };

  const textareaStyle = {
    flex: '1',
    minHeight: '48px',
    maxHeight: '120px',
    padding: '14px 16px',
    backgroundColor: colors.card,
    color: colors.foreground,
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    resize: 'none' as const,
    fontSize: '14px',
    lineHeight: '1.5',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.05)`,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const buttonStyle = {
    padding: '14px',
    backgroundColor: disabled || !message.trim() ? colors.muted : colors.primary,
    color: disabled || !message.trim() ? colors.mutedForeground : colors.primaryForeground,
    border: 'none',
    borderRadius: '12px',
    cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    transition: 'all 0.2s ease',
    boxShadow: disabled || !message.trim() ? 'none' : `0 2px 4px rgba(0, 0, 0, 0.1)`,
  };

  return (
    <div style={containerStyle}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me about your enterprise data..."
        disabled={disabled}
        style={textareaStyle}
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.primary;
          e.target.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.05), 0 0 0 3px ${colors.primary}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.border;
          e.target.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.05)`;
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (!disabled && message.trim()) {
            e.currentTarget.style.backgroundColor = colors.primaryForeground;
            e.currentTarget.style.color = colors.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = colors.primary;
            e.currentTarget.style.color = colors.primaryForeground;
          }
        }}
        title="Send message (Enter)"
      >
        <PaperPlaneIcon style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
}