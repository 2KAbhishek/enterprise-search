'use client';

import React, { useState, useEffect } from 'react';
import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { MCPServerConfig, MCPServerType } from '@/types/mcp';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: MCPServerConfig[];
  onSave: (servers: MCPServerConfig[]) => void;
}

export function SettingsModal({ isOpen, onClose, servers, onSave }: SettingsModalProps) {
  const { colors } = useTheme();
  const [configText, setConfigText] = useState('');
  const [localServers, setLocalServers] = useState<MCPServerConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'json' | 'form'>('form');

  useEffect(() => {
    if (isOpen) {
      setLocalServers([...servers]);
      setConfigText(JSON.stringify(servers, null, 2));
    }
  }, [isOpen, servers]);

  const handleSave = () => {
    try {
      if (activeTab === 'json') {
        const parsed = JSON.parse(configText);
        if (Array.isArray(parsed)) {
          const validatedServers = parsed.map(server => ({
            ...server,
            id: server.id || uuidv4(),
            enabled: server.enabled !== false
          }));
          onSave(validatedServers);
        } else {
          throw new Error('Configuration must be an array');
        }
      } else {
        onSave(localServers);
      }
      onClose();
    } catch (error) {
      alert('Invalid configuration: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const addServer = () => {
    const newServer: MCPServerConfig = {
      id: uuidv4(),
      name: '',
      endpoint: '',
      type: 'custom',
      enabled: true
    };
    setLocalServers([...localServers, newServer]);
  };

  const updateServer = (index: number, field: keyof MCPServerConfig, value: unknown) => {
    const updated = [...localServers];
    updated[index] = { ...updated[index], [field]: value };
    setLocalServers(updated);
  };

  const removeServer = (index: number) => {
    setLocalServers(localServers.filter((_, i) => i !== index));
  };

  const serverTypes: { value: MCPServerType; label: string }[] = [
    { value: 'jira', label: 'Jira' },
    { value: 'confluence', label: 'Confluence' },
    { value: 'github', label: 'GitHub' },
    { value: 'slack', label: 'Slack' },
    { value: 'bitbucket', label: 'Bitbucket' },
    { value: 'custom', label: 'Custom' }
  ];

  const authTypes = [
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'token', label: 'API Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'oauth', label: 'OAuth' }
  ];

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
          maxWidth: '56rem',
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
              MCP Server Configuration
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
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '0.25rem',
              marginBottom: '1.5rem',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <button
                onClick={() => setActiveTab('form')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'form' ? colors.secondary : 'transparent',
                  color: activeTab === 'form' ? colors.primary : colors.mutedForeground,
                  borderBottom: activeTab === 'form' ? `2px solid ${colors.primary}` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'form') {
                    e.currentTarget.style.backgroundColor = colors.muted;
                    e.currentTarget.style.color = colors.foreground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'form') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.mutedForeground;
                  }
                }}
              >
                Form Editor
              </button>
              <button
                onClick={() => setActiveTab('json')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'json' ? colors.secondary : 'transparent',
                  color: activeTab === 'json' ? colors.primary : colors.mutedForeground,
                  borderBottom: activeTab === 'json' ? `2px solid ${colors.primary}` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'json') {
                    e.currentTarget.style.backgroundColor = colors.muted;
                    e.currentTarget.style.color = colors.foreground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'json') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.mutedForeground;
                  }
                }}
              >
                JSON Editor
              </button>
            </div>

            <div style={{ maxHeight: '24rem', overflowY: 'auto' }}>
              {activeTab === 'form' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {localServers.map((server, index) => (
                    <div key={server.id} style={{
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.card,
                      borderRadius: '8px',
                      padding: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{
                          fontWeight: '500',
                          color: colors.cardForeground
                        }}>Server {index + 1}</h3>
                        <button
                          onClick={() => removeServer(index)}
                          style={{
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#991b1b';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#dc2626';
                          }}
                        >
                          <TrashIcon style={{ height: '1rem', width: '1rem' }} />
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: colors.cardForeground,
                            marginBottom: '0.25rem'
                          }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={server.name}
                            onChange={(e) => updateServer(index, 'name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colors.input,
                              color: colors.foreground,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="e.g., Company Jira"
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = colors.ring;
                              e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                              e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.outline = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: colors.cardForeground,
                            marginBottom: '0.25rem'
                          }}>
                            Type
                          </label>
                          <select
                            value={server.type}
                            onChange={(e) => updateServer(index, 'type', e.target.value as MCPServerType)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colors.input,
                              color: colors.foreground,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = colors.ring;
                              e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                              e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.outline = 'none';
                            }}
                          >
                            {serverTypes.map(type => (
                              <option key={type.value} value={type.value} style={{
                                backgroundColor: colors.input,
                                color: colors.foreground
                              }}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: colors.cardForeground,
                            marginBottom: '0.25rem'
                          }}>
                            Endpoint URL
                          </label>
                          <input
                            type="url"
                            value={server.endpoint}
                            onChange={(e) => updateServer(index, 'endpoint', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colors.input,
                              color: colors.foreground,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="https://your-server.com/mcp"
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = colors.ring;
                              e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                              e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.outline = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: colors.cardForeground,
                            marginBottom: '0.25rem'
                          }}>
                            Auth Type
                          </label>
                          <select
                            value={server.auth?.type || 'bearer'}
                            onChange={(e) => updateServer(index, 'auth', { 
                              ...server.auth, 
                              type: e.target.value as 'bearer' | 'token' | 'basic' | 'oauth'
                            })}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colors.input,
                              color: colors.foreground,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = colors.ring;
                              e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                              e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.outline = 'none';
                            }}
                          >
                            {authTypes.map(type => (
                              <option key={type.value} value={type.value} style={{
                                backgroundColor: colors.input,
                                color: colors.foreground
                              }}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: colors.cardForeground,
                            marginBottom: '0.25rem'
                          }}>
                            Token/Password
                          </label>
                          <input
                            type="password"
                            value={server.auth?.token || ''}
                            onChange={(e) => updateServer(index, 'auth', { 
                              ...server.auth, 
                              token: e.target.value 
                            })}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: `1px solid ${colors.border}`,
                              backgroundColor: colors.input,
                              color: colors.foreground,
                              borderRadius: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            placeholder="Your API token"
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = colors.ring;
                              e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                              e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.outline = 'none';
                            }}
                          />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <input
                              type="checkbox"
                              checked={server.enabled}
                              onChange={(e) => updateServer(index, 'enabled', e.target.checked)}
                              style={{
                                marginRight: '0.5rem',
                                height: '1rem',
                                width: '1rem',
                                accentColor: colors.primary,
                                backgroundColor: colors.input,
                                borderRadius: '4px'
                              }}
                            />
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: colors.cardForeground
                            }}>
                              Enable this server
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addServer}
                    style={{
                      width: '100%',
                      border: `2px dashed ${colors.border}`,
                      backgroundColor: colors.card,
                      borderRadius: '8px',
                      padding: '1rem',
                      color: colors.mutedForeground,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.mutedForeground;
                      e.currentTarget.style.color = colors.foreground;
                      e.currentTarget.style.backgroundColor = colors.muted;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.color = colors.mutedForeground;
                      e.currentTarget.style.backgroundColor = colors.card;
                    }}
                  >
                    <PlusIcon style={{
                      height: '1.25rem',
                      width: '1.25rem',
                      margin: '0 auto 0.5rem',
                      display: 'block'
                    }} />
                    Add MCP Server
                  </button>
                </div>
              ) : (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: colors.cardForeground,
                    marginBottom: '0.5rem'
                  }}>
                    JSON Configuration
                  </label>
                  <textarea
                    value={configText}
                    onChange={(e) => setConfigText(e.target.value)}
                    style={{
                      width: '100%',
                      height: '20rem',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.input,
                      color: colors.foreground,
                      borderRadius: '6px',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      resize: 'vertical'
                    }}
                    placeholder="Enter your MCP server configuration as JSON..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.ring;
                      e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.outline = 'none';
                    }}
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: colors.mutedForeground,
                    marginTop: '0.5rem'
                  }}>
                    Edit the JSON configuration directly. Make sure it&apos;s valid JSON.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            padding: '1.5rem',
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.muted
          }}>
            <Dialog.Close asChild>
              <button style={{
                padding: '0.5rem 1rem',
                color: colors.foreground,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.card;
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `2px solid ${colors.ring}`;
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}>
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              style={{
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
              }}
            >
              Save Configuration
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}