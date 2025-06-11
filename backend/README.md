# Enterprise Search Backend

Express.js API server that connects chat interface to Anthropic Claude LLM and external MCP servers.

## Overview

This backend provides a minimal API that:
- Receives chat messages from the frontend
- Queries external MCP servers for enterprise data context
- Sends user message + context to Anthropic Claude
- Returns Claude's intelligent response

## Tech Stack

- **Framework**: Express.js with TypeScript
- **LLM Integration**: `@anthropic-ai/sdk` (official Anthropic SDK)
- **MCP Integration**: `@modelcontextprotocol/sdk` (official MCP SDK)
- **Security**: Helmet, CORS protection
- **Testing**: Jest + Supertest
- **Development**: Nodemon with hot reload

## API Endpoints

### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "enterprise-search-backend",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### `POST /api/chat`
Send a message to the enterprise assistant

**Request:**
```json
{
  "message": "What repositories do I have access to?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I found 12 repositories you have access to: enterprise-search (Private), web-toolkit (Public)...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Anthropic API key
- External MCP servers running (configured in `../mcp-servers.json`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env-sample .env

# Configure your environment variables
# Edit .env with your Anthropic API key

# Start development server
npm run dev

# Or build and start production
npm run build && npm start
```

### Environment Variables

Create a `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# CORS Configuration  
CORS_ORIGIN=http://localhost:3000
```

## MCP Server Configuration

Configure external MCP servers in `../mcp-servers.json`:

```json
{
  "servers": [
    {
      "name": "GitHub",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    }
  ]
}
```

## Architecture

### Services

- **ClaudeService**: Handles communication with Anthropic Claude API
- **MCPService**: Manages connections to external MCP servers  
- **ChatService**: Orchestrates chat flow (MCP context + Claude response)

### Request Flow

1. Frontend sends chat message to `POST /api/chat`
2. ChatService queries all connected MCP servers for relevant data
3. MCP context is formatted and sent to ClaudeService
4. ClaudeService sends user message + context to Anthropic Claude
5. Claude's response is returned to frontend

### Error Handling

- Input validation middleware
- Global error handler
- Graceful MCP server connection failures
- Anthropic API error handling

## Development

### Scripts

```bash
npm run dev          # Start with nodemon (hot reload)
npm run build        # Compile TypeScript to dist/
npm run start        # Start production server
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm test -- ChatService.test.ts
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # App entry point
│   ├── routes/               # Express route handlers
│   │   ├── chat.ts          # Chat endpoint
│   │   └── health.ts        # Health check
│   ├── services/            # Business logic
│   │   ├── ClaudeService.ts # Anthropic Claude integration
│   │   ├── MCPService.ts    # MCP server management
│   │   └── ChatService.ts   # Chat orchestration
│   ├── middleware/          # Express middleware
│   │   ├── validation.ts    # Request validation
│   │   └── errorHandler.ts  # Global error handling
│   └── setupTests.ts        # Test configuration
├── dist/                    # Compiled JavaScript (generated)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest test configuration
└── .eslintrc.js           # ESLint configuration
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Set up process manager (PM2, Docker, etc.)
4. Ensure MCP servers are running
5. Monitor logs and health endpoint

## Security

MVP security measures:
- Helmet for basic HTTP security headers
- CORS protection for frontend origin
- Input validation and sanitization
- Environment variable protection
- Request size limits

## Troubleshooting

### Common Issues

**MCP servers not connecting:**
- Check `mcp-servers.json` configuration
- Verify MCP servers are running externally
- Check environment variables in MCP config

**Anthropic API errors:**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key permissions and rate limits
- Monitor Claude API status

**CORS errors:**
- Verify `CORS_ORIGIN` matches frontend URL
- Check frontend is making requests to correct backend URL