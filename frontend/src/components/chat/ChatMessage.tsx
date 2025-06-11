'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatMessage as ChatMessageType } from '@/lib/api';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { colors } = useTheme();
  
  const isUser = message.role === 'user';
  
  const messageStyle = {
    backgroundColor: isUser ? colors.primary : colors.card,
    color: isUser ? colors.primaryForeground : colors.foreground,
    borderRadius: '12px',
    padding: '12px 16px',
    maxWidth: '80%',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${colors.border}`,
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '12px',
    color: colors.mutedForeground,
    marginTop: '4px',
    textAlign: isUser ? 'right' : 'left',
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
      <div style={messageStyle}>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </div>
      </div>
      <div style={timestampStyle}>
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
}