<div align = "center">

<h1><a href="https://github.com/2kabhishek/enterprise-search">enterprise-search</a></h1>

<a href="https://github.com/2KAbhishek/enterprise-search/blob/main/LICENSE">
<img alt="License" src="https://img.shields.io/github/license/2kabhishek/enterprise-search?style=flat&color=eee&label="> </a>

<a href="https://github.com/2KAbhishek/enterprise-search/graphs/contributors">
<img alt="People" src="https://img.shields.io/github/contributors/2kabhishek/enterprise-search?style=flat&color=ffaaf2&label=People"> </a>

<a href="https://github.com/2KAbhishek/enterprise-search/stargazers">
<img alt="Stars" src="https://img.shields.io/github/stars/2kabhishek/enterprise-search?style=flat&color=98c379&label=Stars"></a>

<a href="https://github.com/2KAbhishek/enterprise-search/network/members">
<img alt="Forks" src="https://img.shields.io/github/forks/2kabhishek/enterprise-search?style=flat&color=66a8e0&label=Forks"> </a>

<a href="https://github.com/2KAbhishek/enterprise-search/watchers">
<img alt="Watches" src="https://img.shields.io/github/watchers/2kabhishek/enterprise-search?style=flat&color=f5d08b&label=Watches"> </a>

<a href="https://github.com/2KAbhishek/enterprise-search/pulse">
<img alt="Last Updated" src="https://img.shields.io/github/last-commit/2kabhishek/enterprise-search?style=flat&color=e06c75&label="> </a>

<h3>Unified Enterprise Search with MCP Integration 🔍⚡</h3>

<figure>
  <img src="docs/images/screenshot.png" alt="enterprise-search in action">
  <br/>
  <figcaption>enterprise-search in action</figcaption>
</figure>

</div>

enterprise-search is an intelligent enterprise assistant that allows teams to query and interact with multiple enterprise systems (Slack, Jira, Confluence, GitHub, Bitbucket) through natural language conversations powered by LLMs and Model Context Protocol (MCP) servers.

## 🏗️ Architecture

### Backend-Heavy Design

```
Frontend (Chat UI) → Backend API → LLM Service + MCP Servers
```

- **Frontend**: Next.js chat interface for natural language queries
- **Backend**: Express.js API handling authentication, MCP management, and LLM integration
- **MCP Layer**: Secure connection to enterprise data sources via MCP servers
- **LLM Integration**: OpenAI/Anthropic/Local models for intelligent responses

### Directory Structure

```
enterprise-search/
├── frontend/          # Next.js web application
├── backend/           # Express.js API server
├── docs/             # Documentation and assets
├── README.md         # Project documentation
└── CLAUDE.md         # Development guidelines
```

## ✨ MVP Features

- **Natural Language Queries**: Ask questions in plain English about your enterprise data
- **Claude LLM Integration**: Powered by Anthropic Claude for intelligent responses
- **MCP Server Support**: Works with any MCP server (GitHub, Jira, Confluence, Slack, Bitbucket)
- **External Configuration**: MCP servers run independently, configured via external JSON
- **Modern Chat Interface**: Clean, responsive chat UI with glassmorphism design
- **Theme Support**: Light/dark mode with system preference detection
- **Comprehensive Testing**: 83 frontend tests with 100% pass rate
- **Simple Backend**: Minimal Express.js API to connect chat to LLM and MCP servers

### 🚧 Future Features (Post-MVP)

- User authentication and sessions
- Conversation history and persistence
- Advanced security and rate limiting
- Team collaboration and shared workspaces
- Database storage for configurations

## ⚡ Setup

### ⚙️ Requirements

- Node.js >= 18.0.0
- npm or yarn
- Docker (optional, for MCP server deployment)

### 💻 Installation

```bash
git clone https://github.com/2kabhishek/enterprise-search
cd enterprise-search

# Install backend dependencies
cd backend
npm install
cp .env-sample .env
# Configure your environment variables

# Install frontend dependencies
cd ../frontend
npm install

# Start both services
cd ../backend && npm run dev &
cd ../frontend && npm run dev
```

### 🔧 Environment Setup

#### Backend Configuration (`backend/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# LLM Service
ANTHROPIC_API_KEY="your-anthropic-key-here"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### MCP Server Configuration (`mcp-servers.json`)

```json
{
  "servers": [
    {
      "name": "GitHub",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token"
      }
    },
    {
      "name": "Jira",
      "command": "npx",
      "args": ["@sooperset/mcp-atlassian"],
      "env": {
        "JIRA_API_TOKEN": "your-jira-token",
        "JIRA_DOMAIN": "your-company.atlassian.net"
      }
    }
  ]
}
```

#### Frontend Configuration (`frontend/.env.local`)

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Usage

### Running the Application

#### Development Mode

```bash
# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

#### Production Mode

```bash
# Build and start backend
cd backend && npm run build && npm start

# Build and start frontend
cd frontend && npm run build && npm start
```

#### Testing

```bash
# Frontend tests (Jest + React Testing Library) - 83 tests, 100% pass rate
cd frontend && npm test

# Run type checking and linting
cd frontend && npm run type-check && npm run lint

# Format code with Prettier
cd frontend && npm run format

# Backend tests (Jest + Supertest) - In development
cd backend && npm test

# Future: End-to-end tests with Cypress (post-MVP)
```

### Using the Enterprise Assistant (MVP)

1. **Configure MCP Servers**: Update `mcp-servers.json` with your credentials
2. **Start MCP Servers**: Run MCP servers manually in separate terminals
3. **Start the Application**: Launch backend and frontend
4. **Chat**: Ask questions about your enterprise data

#### Example Conversations

```
You: "What repositories do I have access to?"
Assistant: I found 12 repositories you have access to:
- enterprise-search (Private, Updated 2 hours ago)
- web-toolkit (Public, Updated 1 day ago)
- api-gateway (Private, Updated 3 days ago)
...

You: "Show me recent issues in the enterprise-search repo"
Assistant: Here are the recent issues in enterprise-search:
- #23: Add authentication system (Open, created yesterday)
- #22: Fix dark theme toggle (Closed, updated 2 days ago)
- #21: Implement MCP integration (Open, created 3 days ago)
```

### Manual MCP Server Setup

1. **Start GitHub MCP Server**:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=your_token npx @modelcontextprotocol/server-github
```

2. **Start Jira MCP Server**:

```bash
JIRA_API_TOKEN=your_token JIRA_DOMAIN=company.atlassian.net npx @sooperset/mcp-atlassian
```

3. **Configure in mcp-servers.json**: Update the configuration file to match your running servers

## 🏗️ What's Next

### ✅ MVP To-Do

- [x] Research Model Context Protocol (MCP)
- [x] Design MVP application architecture
- [x] Choose tech stack (Next.js + Express.js + Claude)
- [x] Set up project structure with frontend/backend separation
- [x] Create modern chat interface with glassmorphism design
- [x] Implement theme switching (light/dark) with system detection
- [x] Add comprehensive frontend test suite (83 tests, 100% pass rate)
- [x] Set up Prettier and ESLint configuration for consistent code style
- [x] Add GitHub Actions CI/CD pipeline for frontend and backend
- [x] Clean up documentation and remove boilerplate content
- [x] Create basic backend API structure with Express.js
- [x] Implement Anthropic Claude LLM service integration
- [x] Create MCP client service for external server communication
- [x] Build simple chat API endpoint
- [x] Create external MCP server configuration file
- [x] Add backend unit tests for core functionality
- [x] Connect frontend chat to backend APIs
- [x] Test with GitHub MCP server integration

### 🎯 Future Features (Post-MVP)

- **User Authentication**: JWT-based user sessions
- **Database Storage**: Persistent conversation history
- **Multi-LLM Support**: OpenAI, Local Ollama integration
- **Advanced Security**: Rate limiting, input validation
- **Team Collaboration**: Multi-user workspaces
- **Integrated MCP Management**: In-app server configuration

## 🧑‍💻 Behind The Code

### 🌈 Inspiration

enterprise-search was inspired by the need for a unified search experience across fragmented enterprise tools. With the introduction of Anthropic's Model Context Protocol (MCP), we saw an opportunity to standardize how search queries interact with diverse data sources.

### 💡 Challenges/Learnings

- **Protocol Standardization**: Implementing MCP clients for consistent communication with various server types
- **Real-time Aggregation**: Efficiently combining and ranking results from multiple sources
- **Authentication Complexity**: Handling different auth methods across enterprise systems
- **Performance Optimization**: Ensuring fast response times when querying multiple MCP servers

### 🧰 Tech Stack

**MVP Stack:**

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI, Glassmorphism design
- **Backend**: Express.js, TypeScript, minimal API (in development)
- **MCP Integration**: Official @modelcontextprotocol/sdk with stdio transport
- **LLM Service**: Anthropic Claude (primary)
- **Configuration**: prettier.config.js, eslint.config.js, external JSON for MCP servers
- **Testing**: Jest, React Testing Library, Supertest (83 frontend tests, 100% pass rate)
- **Development**: ESLint, Prettier, TypeScript strict mode, Nodemon

**Future Enhancements:**

- User authentication and database storage
- Multiple LLM providers (OpenAI, Local Ollama)
- Cypress for E2E testing
- Advanced security and rate limiting
- Integrated MCP server management

### 🔍 MCP Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io/) — Official MCP specification
- [Anthropic MCP Guide](https://docs.anthropic.com/en/docs/build-with-claude/mcp) — Implementation guide
- [MCP GitHub Repository](https://github.com/modelcontextprotocol) — Reference implementations
- [Atlassian MCP Server](https://github.com/sooperset/mcp-atlassian) — Jira/Confluence integration

<hr>

<div align="center">

<strong>⭐ hit the star button if you found this useful ⭐</strong><br>

<a href="https://github.com/2KAbhishek/enterprise-search">Source</a>
| <a href="https://2kabhishek.github.io/blog" target="_blank">Blog </a>
| <a href="https://twitter.com/2kabhishek" target="_blank">Twitter </a>
| <a href="https://linkedin.com/in/2kabhishek" target="_blank">LinkedIn </a>
| <a href="https://2kabhishek.github.io/links" target="_blank">More Links </a>
| <a href="https://2kabhishek.github.io/projects" target="_blank">Other Projects </a>

</div>
