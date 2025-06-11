'use client';

import React, { useState, useEffect } from 'react';
import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { MCPServerConfig, MCPServerType } from '@/types/mcp';
import { v4 as uuidv4 } from 'uuid';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: MCPServerConfig[];
  onSave: (servers: MCPServerConfig[]) => void;
}

export function SettingsModal({ isOpen, onClose, servers, onSave }: SettingsModalProps) {
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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              MCP Server Configuration
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <Cross2Icon className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 border-b">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  activeTab === 'form'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Form Editor
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  activeTab === 'json'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                JSON Editor
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'form' ? (
                <div className="space-y-6">
                  {localServers.map((server, index) => (
                    <div key={server.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Server {index + 1}</h3>
                        <button
                          onClick={() => removeServer(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={server.name}
                            onChange={(e) => updateServer(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Company Jira"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={server.type}
                            onChange={(e) => updateServer(index, 'type', e.target.value as MCPServerType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            {serverTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endpoint URL
                          </label>
                          <input
                            type="url"
                            value={server.endpoint}
                            onChange={(e) => updateServer(index, 'endpoint', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://your-server.com/mcp"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Auth Type
                          </label>
                          <select
                            value={server.auth?.type || 'bearer'}
                            onChange={(e) => updateServer(index, 'auth', { 
                              ...server.auth, 
                              type: e.target.value as 'bearer' | 'token' | 'basic' | 'oauth'
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            {authTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Token/Password
                          </label>
                          <input
                            type="password"
                            value={server.auth?.token || ''}
                            onChange={(e) => updateServer(index, 'auth', { 
                              ...server.auth, 
                              token: e.target.value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your API token"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={server.enabled}
                              onChange={(e) => updateServer(index, 'enabled', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Enable this server
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addServer}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mx-auto mb-2" />
                    Add MCP Server
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON Configuration
                  </label>
                  <textarea
                    value={configText}
                    onChange={(e) => setConfigText(e.target.value)}
                    className="w-full h-80 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter your MCP server configuration as JSON..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Edit the JSON configuration directly. Make sure it&apos;s valid JSON.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Configuration
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}