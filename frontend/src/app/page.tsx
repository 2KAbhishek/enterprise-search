'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ServersModal } from '@/components/settings/ServersModal';
import { apiClient } from '@/lib/api';

export default function Home() {
  const { colors } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await apiClient.checkHealth();
        setIsBackendHealthy(true);
      } catch (error) {
        console.error('Backend health check failed:', error);
        setIsBackendHealthy(false);
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '80rem',
        width: '100%',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem 0 1rem',
          borderBottom: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: colors.foreground,
            marginBottom: '0.5rem'
          }}>
            Enterprise Assistant
          </h2>
          <p style={{
            fontSize: '1rem',
            color: colors.mutedForeground
          }}>
            AI-powered chat interface connected to your enterprise systems
          </p>
          
          {isBackendHealthy !== null && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: colors.mutedForeground,
                backgroundColor: colors.card,
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`
              }}>
                <span style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: isBackendHealthy ? '#10b981' : '#ef4444'
                }}></span>
                <span>
                  Backend {isBackendHealthy ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatInterface />
        </div>
      </main>

      <ServersModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}