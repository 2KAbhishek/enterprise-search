'use client';

import React from 'react';
import {useTheme} from '@/contexts/ThemeContext';
import {ChatMessage as ChatMessageType} from '@/lib/api';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({message}: ChatMessageProps) {
    const {colors} = useTheme();

    const isUser = message.role === 'user';

    const messageStyle = {
        background: isUser ? colors.primary : colors.card,
        backdropFilter: isUser ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: isUser ? 'none' : 'blur(10px)',
        color: isUser ? colors.primaryForeground : colors.foreground,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '14px 18px',
        maxWidth: '75%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        boxShadow: isUser
            ? '0 2px 8px rgba(37, 99, 235, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        border: isUser ? 'none' : `1px solid ${colors.border}`,
        position: 'relative' as const,
        wordBreak: 'break-word' as const,
        lineHeight: '1.5',
        fontSize: '14px'
    };

    const timestampStyle: React.CSSProperties = {
        fontSize: '12px',
        color: colors.mutedForeground,
        marginTop: '4px',
        textAlign: isUser ? 'right' : 'left'
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '24px',
                alignItems: isUser ? 'flex-end' : 'flex-start'
            }}>
            {!isUser && (
                <div
                    style={{
                        fontSize: '12px',
                        color: colors.mutedForeground,
                        marginBottom: '6px',
                        marginLeft: '4px',
                        fontWeight: '500'
                    }}>
                    🤖 Assistant
                </div>
            )}
            <div style={messageStyle}>
                <div
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0
                    }}>
                    {message.content}
                </div>
            </div>
            <div
                style={{
                    ...timestampStyle,
                    marginLeft: isUser ? 0 : '4px',
                    marginRight: isUser ? '4px' : 0,
                    marginTop: '6px'
                }}>
                {formatTime(message.timestamp)}
            </div>
        </div>
    );
}
