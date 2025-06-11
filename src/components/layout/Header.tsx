'use client';

import React from 'react';
import { GearIcon } from '@radix-ui/react-icons';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🔍 Enterprise Search
            </h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              MCP Powered
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Settings"
            >
              <GearIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}