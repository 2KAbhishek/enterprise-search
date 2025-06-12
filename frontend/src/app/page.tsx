'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ServersModal } from '@/components/settings/ServersModal';

export default function Home() {
  const { colors } = useTheme();
  const [isServersModalOpen, setIsServersModalOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header onServersClick={() => setIsServersModalOpen(true)} />
      
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
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatInterface />
        </div>
      </main>

      <ServersModal
        isOpen={isServersModalOpen}
        onClose={() => setIsServersModalOpen(false)}
      />
    </div>
  );
}