# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise Search is an intelligent enterprise assistant MVP that enables users to query enterprise systems (GitHub, Jira, Confluence, Slack, Bitbucket) through natural language conversations. The system uses Anthropic Claude and Model Context Protocol (MCP) servers to provide intelligent responses with enterprise context.

## Architecture Overview

### Simple MVP Design

```
Frontend (Chat UI) → Backend API → Claude LLM + External MCP Servers
```

- **Frontend**: Next.js chat interface for natural language queries
- **Backend**: Minimal Express.js API to connect chat to Claude and MCP servers
- **MCP Layer**: External MCP servers run independently, configured via JSON file
- **LLM Integration**: Anthropic Claude for intelligent responses

### Directory Structure

```
enterprise-search/
├── frontend/              # Next.js web application
│   ├── src/
│   │   ├── components/    # React components (chat, settings)
│   │   ├── contexts/      # React contexts (theme, auth)
│   │   ├── lib/          # Frontend utilities
│   │   ├── app/          # Next.js App Router
│   │   └── types/        # TypeScript definitions
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # API route handlers
│   │   ├── services/     # Business logic (MCP, LLM)
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Auth, validation, etc.
│   │   └── utils/        # Backend utilities
├── docs/                 # Documentation and assets
├── README.md            # Project documentation
└── CLAUDE.md           # Development guidelines
```

## Tech Stack

**MVP Focus:**

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, minimal API
- **MCP Integration**: Official @modelcontextprotocol/sdk with stdio transport
- **LLM Service**: Anthropic Claude only
- **Configuration**: External JSON file for MCP servers
- **Testing**: Jest, React Testing Library, Supertest
- **Development**: ESLint, Prettier, TypeScript strict mode, Nodemon

## Development Commands

### Backend

```bash
cd backend
npm run dev          # Start development server with nodemon
npm run build        # TypeScript compilation
npm run start        # Start production server
npm run test         # Run unit tests with Jest
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Frontend

```bash
cd frontend
npm run dev          # Start Next.js development server
npm run build        # Production build
npm run start        # Start production server
npm run test         # Run unit tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## MVP Backend API Design

### Core Services

- **MCPService** (`/backend/src/services/mcp.ts`) - MCP server communication
- **ClaudeService** (`/backend/src/services/claude.ts`) - Anthropic Claude integration
- **ChatService** (`/backend/src/services/chat.ts`) - Chat handling and context management

### API Endpoints (MVP)

```
POST /api/chat             # Send message to assistant
GET  /api/health           # Health check
```

### External Configuration

MCP servers are configured in `mcp-servers.json` and run independently:

```json
{
  "servers": [
    {
      "name": "GitHub",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "token"
      }
    }
  ]
}
```

### MCP Integration Notes

#### Supported MCP Servers

- **GitHub**: `@modelcontextprotocol/server-github` or `ghcr.io/github/github-mcp-server`
- **Jira**: `@sooperset/mcp-atlassian`
- **Confluence**: Part of Atlassian MCP server
- **Slack**: Custom MCP server implementations
- **Bitbucket**: `@aashari/mcp-server-atlassian-bitbucket`

#### MCP Client Implementation (MVP)

- Located in `/backend/src/services/mcp.ts`
- Uses official `@modelcontextprotocol/sdk` with stdio transport
- Connects to externally running MCP servers via stdio
- Reads configuration from external `mcp-servers.json` file
- Supports resource access and tool execution

#### MCP Server Configuration (MVP)

External JSON file configuration:

```typescript
interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env: {
    [key: string]: string;
  };
}
```

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns in `/src/components/`
- Use theme system with inline styles for consistent theming
- Implement proper error handling for MCP connections
- Add unit tests for business logic
- Add E2E tests for user workflows
- **NEVER add comments unless absolutely necessary** - write self-documenting code with clear variable and function names

### Security Considerations (MVP)

- **External credentials**: MCP server credentials managed in external JSON file (user responsibility)
- **Basic CORS protection**: Restrict frontend origins in development
- **Environment variables**: Use .env for Claude API key
- **Input validation**: Basic sanitization of user inputs and LLM responses
- **No authentication**: MVP runs without user sessions (single user)

### Testing Strategy (MVP)

- **Unit Tests**: Core logic, utilities, MCP client, Claude service
- **Integration Tests**: API routes, chat endpoints
- **Mock Services**: Mock Claude API and MCP servers for testing
- **Future**: Cypress E2E tests (post-MVP)

## MVP Development Focus

### What's Included

- Simple chat interface
- Claude LLM integration
- External MCP server communication
- Basic error handling
- Unit and integration tests

### What's NOT Included (Future)

- User authentication
- Database storage
- Advanced security
- Rate limiting
- Session management
- Advanced error handling
- Docker deployment

## Contributing

1. Always run `npm run lint` and `npm run type-check` before committing
2. Add tests for new features and bug fixes
3. Update documentation for API changes
4. Follow the existing code patterns and architecture
5. Test MCP server integrations thoroughly

## Git Workflow and Commit Standards

### Commit Guidelines

- **Use conventional commits**: `type(scope): description`
- **Make atomic commits**: Each commit should represent one logical change
- **Use `git add -p`** to stage specific lines/hunks - add entire files at once unless absolutely necessary (e.g., new file creation)
- **Stage changes in logical patches**: Group related changes together, separate unrelated changes
- **Never add AI assistants as co-authors** in commit messages
- **Write clear, descriptive commit messages** explaining the "why" not just the "what"
- **Review each hunk carefully** before staging to ensure it belongs in the current commit

### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation updates
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without behavior changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
