# Enterprise Search Frontend

Next.js chat interface for the Enterprise Search MVP.

## Overview

This frontend provides a simple chat UI where users can ask questions in natural language about their enterprise data. The interface communicates with the backend API to get responses from Claude LLM powered by MCP server data.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **State**: React hooks (useState, useEffect)
- **API**: Fetch API to backend
- **Testing**: Jest + React Testing Library

## Features

- Clean, responsive chat interface
- Dark/light theme toggle with system preference detection
- Real-time chat with streaming responses (future)
- Error handling and loading states
- Mobile-friendly design

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main chat page
│   │   └── icon.svg           # App favicon
│   ├── components/            # React components
│   │   ├── chat/              # Chat interface components
│   │   ├── layout/            # Layout components (Header)
│   │   ├── ui/                # Reusable UI components
│   │   └── __tests__/         # Component tests
│   ├── contexts/              # React contexts
│   │   └── ThemeContext.tsx   # Theme management
│   ├── lib/                   # Utilities and services
│   │   └── api.ts             # API client functions
│   └── types/                 # TypeScript type definitions
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── next.config.ts             # Next.js configuration
```

## API Integration

The frontend communicates with the backend via simple REST API:

```typescript
// Send chat message
const response = await fetch(`${API_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userInput })
});

const data = await response.json();
```

## Components

### Main Components

- **ChatInterface**: Main chat container with message list and input
- **ChatMessage**: Individual message component (user/assistant)
- **ChatInput**: Message input with send button
- **Header**: App header with title and theme toggle
- **ThemeToggle**: Dark/light mode toggle

### Theme System

Uses React Context for theme management with:
- System preference detection
- Manual override persistence
- Smooth transitions between themes
- Semantic color system for consistency

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

The build outputs static files to `.next/` directory that can be deployed to any static hosting service or Node.js server.

## MVP Scope

For the MVP, the frontend focuses on:
- Simple chat interface
- Basic error handling
- Theme support
- Responsive design

Future enhancements will include:
- User authentication
- Conversation history
- Real-time streaming
- Advanced UI features