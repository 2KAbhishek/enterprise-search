'use client';

import React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: never[];
  onSave: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { colors } = useTheme();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 50
        }} />
        <Dialog.Content style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.card,
          borderRadius: '8px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          zIndex: 50,
          width: '100%',
          maxWidth: '32rem',
          maxHeight: '90vh',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: `1px solid ${colors.border}`
          }}>
            <Dialog.Title style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: colors.cardForeground
            }}>
              Settings
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{
                padding: '0.5rem',
                borderRadius: '6px',
                color: colors.mutedForeground,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.muted;
                e.currentTarget.style.color = colors.foreground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.mutedForeground;
              }}>
                <Cross2Icon style={{ height: '1rem', width: '1rem' }} />
              </button>
            </Dialog.Close>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{
              backgroundColor: colors.muted,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: colors.foreground,
                marginBottom: '0.5rem'
              }}>
                MCP Server Configuration
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: colors.mutedForeground,
                lineHeight: '1.4'
              }}>
                MCP servers are configured externally via the backend&apos;s <code style={{
                  backgroundColor: colors.card,
                  padding: '0.125rem 0.25rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>mcp-servers.json</code> file.
              </p>
            </div>

            <div style={{
              backgroundColor: colors.muted,
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: colors.foreground,
                marginBottom: '0.5rem'
              }}>
                About
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: colors.mutedForeground,
                lineHeight: '1.4',
                marginBottom: '0.5rem'
              }}>
                Enterprise Assistant connects to your business systems through Model Context Protocol (MCP) servers.
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: colors.mutedForeground,
                lineHeight: '1.4'
              }}>
                To add or configure MCP servers, update the backend configuration and restart the service.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1.5rem',
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.muted
          }}>
            <Dialog.Close asChild>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}>
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}