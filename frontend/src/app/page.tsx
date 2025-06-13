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
      height: '100vh',
      backgroundColor: colors.background,
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      overscrollBehavior: 'none'
    }}>
      <Header onServersClick={() => setIsServersModalOpen(true)} />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '80rem',
        width: '100%',
        margin: '0 auto',
        padding: '0 1rem',
        paddingBottom: '120px',
        overflow: 'hidden'
      }}>

        <div style={{ 
          flex: 1, 
          minHeight: 0,
          position: 'relative'
        }}>
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