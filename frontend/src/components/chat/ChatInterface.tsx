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
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { colors } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Remove initial welcome message - we'll show it differently

  const handleSendMessage = async (content: string) => {
    // Transition to chat state on first message
    if (!hasStartedChatting) {
      setHasStartedChatting(true);
    }

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
    position: 'relative' as const,
  };

  const messagesContainerStyle = {
    flex: '1',
    overflowY: 'auto' as const,
    padding: '16px',
    paddingBottom: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    maxHeight: 'calc(100vh - 180px)',
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

  if (!hasStartedChatting) {
    // Initial welcome state - centered layout
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        backgroundColor: colors.background,
      }}>
        {/* Welcome Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          maxWidth: '600px'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🔍
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.foreground,
            marginBottom: '0.75rem'
          }}>
            Welcome to Enterprise Search
          </h2>
          <p style={{
            fontSize: '1rem',
            color: colors.mutedForeground,
            lineHeight: '1.5'
          }}>
            I can help you find information from your connected systems like GitHub, Jira, Confluence, and more. What would you like to know?
          </p>
        </div>

        {/* Centered Chat Input */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: colors.card,
          borderRadius: '24px',
          padding: '8px',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
          border: `1px solid ${colors.border}`,
        }}>
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading}
            placeholder="Ask me about your enterprise data..."
            centerMode={true}
          />
        </div>
      </div>
    );
  }

  // Regular chat state
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
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}>
            <div style={{
              fontSize: '12px',
              color: colors.mutedForeground,
              marginBottom: '6px',
              marginLeft: '4px',
              fontWeight: '500'
            }}>
              🤖 Assistant
            </div>
            <div style={{
              backgroundColor: colors.card,
              borderRadius: '18px 18px 18px 4px',
              padding: '14px 18px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                gap: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: colors.primary,
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out infinite both',
                  animationDelay: '0s'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: colors.primary,
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out infinite both',
                  animationDelay: '0.16s'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: colors.primary,
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out infinite both',
                  animationDelay: '0.32s'
                }} />
              </div>
              <span style={{
                color: colors.mutedForeground,
                fontSize: '14px'
              }}>Assistant is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Chat Input */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '80rem',
        padding: '0 1rem',
        zIndex: 10,
      }}>
        <div style={{
          backgroundColor: colors.card,
          borderRadius: '24px',
          padding: '8px',
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.15)`,
          border: `1px solid ${colors.border}`,
        }}>
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}