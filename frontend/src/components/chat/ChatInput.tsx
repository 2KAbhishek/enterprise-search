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
    gap: '8px',
    padding: '16px',
    backgroundColor: colors.card,
    borderTop: `1px solid ${colors.border}`,
  };

  const textareaStyle = {
    flex: '1',
    minHeight: '44px',
    maxHeight: '120px',
    padding: '12px',
    backgroundColor: colors.background,
    color: colors.foreground,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    resize: 'none' as const,
    fontSize: '14px',
    lineHeight: '1.4',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const buttonStyle = {
    padding: '12px',
    backgroundColor: disabled ? colors.muted : colors.primary,
    color: disabled ? colors.mutedForeground : colors.primaryForeground,
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    transition: 'all 0.2s ease',
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