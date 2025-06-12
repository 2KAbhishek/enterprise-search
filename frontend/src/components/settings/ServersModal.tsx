'use client';

import React, { useEffect, useState } from 'react';
import { Cross2Icon, CheckCircledIcon, CrossCircledIcon, GearIcon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient, MCPServer, ServersResponse } from '@/lib/api';

interface ServersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServersModal({ isOpen, onClose }: ServersModalProps) {
  const { colors } = useTheme();
  const [serversData, setServersData] = useState<ServersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchServers();
    }
  }, [isOpen]);

  const fetchServers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getServers();
      setServersData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MCP servers');
    } finally {
      setLoading(false);
    }
  };

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
              MCP Servers
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

          <div style={{ padding: '1.5rem', maxHeight: '60vh', overflow: 'auto' }}>
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                color: colors.mutedForeground
              }}>
                <GearIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Loading MCP server information...
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  Error loading settings: {error}
                </p>
              </div>
            )}

            {serversData && !loading && (
              <>
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
                    MCP Server Status
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.foreground }}>
                        {serversData.totalServers}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.mutedForeground }}>
                        Total Servers
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>
                        {serversData.connectedCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.mutedForeground }}>
                        Connected
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.foreground }}>
                        {serversData.totalTools}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.mutedForeground }}>
                        Available Tools
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {serversData.servers.map((server) => (
                    <div
                      key={server.name}
                      style={{
                        backgroundColor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: colors.foreground
                          }}>
                            {server.name}
                          </h4>
                          {server.status === 'connected' ? (
                            <CheckCircledIcon style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
                          ) : (
                            <CrossCircledIcon style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          backgroundColor: server.status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: server.status === 'connected' ? '#10b981' : '#ef4444'
                        }}>
                          {server.toolCount} tools
                        </span>
                      </div>
                      
                      {server.error && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#ef4444',
                          marginBottom: '0.5rem'
                        }}>
                          Error: {server.error}
                        </div>
                      )}

                      {server.tools.length > 0 && (
                        <details style={{ marginTop: '0.5rem' }}>
                          <summary style={{
                            fontSize: '0.75rem',
                            color: colors.mutedForeground,
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                          }}>
                            View available tools ({server.tools.length})
                          </summary>
                          <div style={{
                            maxHeight: '12rem',
                            overflow: 'auto',
                            paddingLeft: '1rem',
                            paddingRight: '0.5rem',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            backgroundColor: colors.muted,
                            padding: '0.5rem'
                          }}>
                            <div style={{
                              display: 'grid',
                              gap: '0.5rem'
                            }}>
                              {server.tools.map((tool) => (
                                <div key={tool.name} style={{
                                  fontSize: '0.75rem',
                                  color: colors.mutedForeground,
                                  padding: '0.25rem',
                                  backgroundColor: colors.card,
                                  borderRadius: '4px',
                                  border: `1px solid ${colors.border}`
                                }}>
                                  <div style={{
                                    color: colors.foreground,
                                    fontWeight: '500',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    marginBottom: '0.125rem'
                                  }}>
                                    {tool.name}
                                  </div>
                                  {tool.description && (
                                    <div style={{
                                      fontSize: '0.6875rem',
                                      lineHeight: '1.2',
                                      color: colors.mutedForeground
                                    }}>
                                      {tool.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: colors.muted,
                  borderRadius: '8px',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: colors.mutedForeground,
                    lineHeight: '1.4'
                  }}>
                    MCP servers are configured via the backend&apos;s <code style={{
                      backgroundColor: colors.card,
                      padding: '0.125rem 0.25rem',
                      borderRadius: '4px'
                    }}>mcp-servers.json</code> file. To add or modify servers, update the configuration and restart the service.
                  </p>
                </div>
              </>
            )}
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