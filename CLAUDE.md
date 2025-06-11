# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise Search is a Next.js web application that provides unified search across multiple enterprise systems using Model Context Protocol (MCP) servers. Users can search Slack, Jira, Confluence, GitHub, Bitbucket, and other platforms through a single interface.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js with Express.js, JSON-RPC 2.0 client
- **Database**: SQLite (development) / PostgreSQL (production)
- **State Management**: React Query + Zustand
- **Testing**: Jest, React Testing Library, Playwright
- **DevOps**: ESLint, Prettier, Husky

## Architecture

### Core Components
- **Search Interface** (`/src/components/search/`) - Main search UI
- **MCP Manager** (`/src/lib/mcp/`) - MCP server communication
- **Results Aggregator** (`/src/lib/aggregator/`) - Result ranking and deduplication
- **Settings Modal** (`/src/components/settings/`) - MCP server configuration
- **API Routes** (`/src/app/api/`) - Backend endpoints

### Data Flow
```
User Query → Search API → MCP Manager → Multiple MCP Servers → Results Aggregation → UI Display
```

## Repository Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── search/         # Search interface
│   │   ├── settings/       # Configuration modal
│   │   └── results/        # Result display
│   ├── lib/                # Utilities and core logic
│   │   ├── mcp/           # MCP client implementation
│   │   ├── aggregator/    # Result processing
│   │   └── db/            # Database utilities
│   ├── app/               # Next.js App Router
│   │   ├── api/           # Backend endpoints
│   │   └── page.tsx       # Main search page
│   └── types/             # TypeScript definitions
├── tests/                 # Test files
├── docs/                  # Documentation
└── config files          # ESLint, Prettier, etc.
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## MCP Integration Notes

### Supported MCP Servers
- **Jira**: `@sooperset/mcp-atlassian` or custom implementations
- **Confluence**: Part of Atlassian MCP server
- **GitHub**: Community implementations
- **Slack**: Custom MCP server implementations
- **Bitbucket**: `@aashari/mcp-server-atlassian-bitbucket`

### MCP Client Implementation
- Located in `/src/lib/mcp/client.ts`
- Uses official `@modelcontextprotocol/sdk` with SSE transport
- Handles authentication and connection management
- Supports concurrent requests to multiple servers
- Implements resource listing and searching capabilities

### Configuration Format
MCP servers are configured via JSON in the settings modal:
```json
{
  "name": "Server Name",
  "endpoint": "http://localhost:3001",
  "type": "jira|confluence|github|slack|bitbucket",
  "enabled": true,
  "auth": {
    "type": "bearer|token|basic",
    "token": "auth-token"
  }
}
```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow existing component patterns in `/src/components/`
- Use Tailwind CSS for styling
- Implement proper error handling for MCP connections
- Add unit tests for business logic
- Add E2E tests for user workflows

### Security Considerations
- Never log or expose authentication tokens
- Validate all MCP server configurations
- Sanitize search queries and results
- Implement proper CORS policies
- Use environment variables for sensitive data

### Testing Strategy
- **Unit Tests**: Core logic, utilities, MCP client
- **Integration Tests**: API routes, database operations
- **E2E Tests**: Search workflows, settings configuration
- **Mock MCP Servers**: For testing without external dependencies

## Deployment Notes

### Environment Variables
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
DEFAULT_MCP_SERVERS='[...]'
NEXTAUTH_URL="https://..."
```

### Docker Support
- Dockerfile for containerized deployment
- Docker Compose for local development with MCP servers
- Health checks for MCP server connectivity

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
- **ALWAYS use `git add -p`** to stage specific lines/hunks - NEVER add entire files at once unless absolutely necessary (e.g., new file creation)
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

### Examples
```bash
git add -p src/components/search/
git commit -m "feat(search): add real-time search with result ranking"

git add -p src/lib/mcp/client.ts
git commit -m "feat(mcp): integrate official SDK with SSE transport"

git add -p tests/
git commit -m "test(mcp): add unit tests for client connection handling"
```