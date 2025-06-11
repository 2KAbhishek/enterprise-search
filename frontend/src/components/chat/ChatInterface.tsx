'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient, ChatMessage as ChatMessageType } from '@/lib/api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { colors } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your enterprise assistant. I can help you find information from your connected systems like GitHub, Jira, Confluence, and more. What would you like to know?',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendMessage(content);
      
      if (response.success && response.response) {
        const assistantMessage: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
      
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Something went wrong'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: colors.background,
  };

  const messagesContainerStyle = {
    flex: '1',
    overflowY: 'auto' as const,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const loadingIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.mutedForeground,
    fontStyle: 'italic',
    marginBottom: '16px',
  };

  const errorStyle = {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '6px',
    margin: '0 16px 16px',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}
      
      <div style={messagesContainerStyle}>
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div style={loadingIndicatorStyle}>
            <div style={{
              width: '16px',
              height: '16px',
              border: `2px solid ${colors.muted}`,
              borderTop: `2px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <span>Assistant is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}