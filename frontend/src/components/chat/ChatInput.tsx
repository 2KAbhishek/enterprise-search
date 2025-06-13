'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  centerMode?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Ask me about your enterprise data...",
  centerMode = false 
}: ChatInputProps) {
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
    padding: centerMode ? '8px' : '16px',
    backgroundColor: 'transparent',
  };

  const textareaStyle = {
    flex: '1',
    minHeight: centerMode ? '52px' : '48px',
    maxHeight: '120px',
    padding: centerMode ? '16px 20px' : '14px 16px',
    backgroundColor: centerMode ? colors.background : colors.card,
    color: colors.foreground,
    border: centerMode ? 'none' : `2px solid ${colors.border}`,
    borderRadius: centerMode ? '20px' : '12px',
    resize: 'none' as const,
    fontSize: '14px',
    lineHeight: '1.5',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: centerMode ? 'none' : `0 2px 4px rgba(0, 0, 0, 0.05)`,
    transition: 'all 0.2s ease',
  };

  const buttonStyle = {
    padding: centerMode ? '16px' : '14px',
    backgroundColor: disabled || !message.trim() ? colors.muted : colors.primary,
    color: disabled || !message.trim() ? colors.mutedForeground : colors.primaryForeground,
    border: 'none',
    borderRadius: centerMode ? '20px' : '12px',
    cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: centerMode ? '52px' : '48px',
    transition: 'all 0.2s ease',
    boxShadow: disabled || !message.trim() ? 'none' : `0 2px 4px rgba(0, 0, 0, 0.1)`,
  };

  return (
    <div style={containerStyle}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={textareaStyle}
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
        }}
        onMouseEnter={(e) => {
          if (centerMode) {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}20`;
          } else {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.08), 0 0 0 1px ${colors.primary}30`;
          }
        }}
        onMouseLeave={(e) => {
          if (centerMode) {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }
          } else {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.05)`;
            }
          }
        }}
        onFocus={(e) => {
          if (centerMode) {
            e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`;
            e.target.style.transform = 'scale(1.02)';
          } else {
            e.target.style.borderColor = colors.primary;
            e.target.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.05), 0 0 0 3px ${colors.primary}20`;
          }
        }}
        onBlur={(e) => {
          if (centerMode) {
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'scale(1)';
          } else {
            e.target.style.borderColor = colors.border;
            e.target.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.05)`;
          }
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (!disabled && message.trim()) {
            if (centerMode) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.15)`;
            } else {
              e.currentTarget.style.backgroundColor = colors.primaryForeground;
              e.currentTarget.style.color = colors.primary;
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            if (centerMode) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.1)`;
            } else {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.color = colors.primaryForeground;
            }
          }
        }}
        title="Send message (Enter)"
      >
        <PaperPlaneIcon style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
}