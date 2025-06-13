<div align = "center">

<h1>enterprise-search</h1>

<h3>Unified Enterprise Search with MCP Integration 🔍⚡</h3>

<figure>
  <img src="docs/images/screenshot.png" alt="enterprise-search in action">
  <br/>
  <figcaption>enterprise-search in action</figcaption>
</figure>

</div>

enterprise-search is an intelligent enterprise assistant that allows teams to query and interact with multiple enterprise systems (Slack, Jira, Confluence, GitHub, Bitbucket) through natural language conversations powered by LLMs and Model Context Protocol (MCP) servers.

## ✨ Features

- **Natural Language Queries**: Ask questions in plain English about your enterprise data
- **Claude LLM Integration**: Powered by Anthropic Claude for intelligent responses
- **MCP Server Support**: Works with any MCP server (GitHub, Jira, Confluence, Slack, Bitbucket)
- **External Configuration**: MCP servers run independently, configured via external JSON
- **Modern Chat Interface**: Clean, responsive chat UI with glassmorphism design
- **Theme Support**: Light/dark mode with system preference detection
- **Comprehensive Testing**: 83 frontend tests with 100% pass rate
- **Simple Backend**: Minimal Express.js API to connect chat to LLM and MCP servers

## ⚡ Setup

### ⚙️ Requirements

- Node.js >= 18.0.0
- npm or yarn
- Docker (optional, for MCP server deployment)

### 💻 Installation

```bash
git clone https://github.com/2kabhishek/enterprise-search
cd enterprise-search

# backend setup
cd backend
npm install
cp .env-sample .env # Configure your environment variables
npm run dev

# frontend setup
cd ../frontend
npm install
npm run dev
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

### Development Commands

#### Backend

```bash
cd backend
npm run dev          # Start development server with nodemon
npm run build        # TypeScript compilation
npm run start        # Start production server
npm run test         # Run unit tests with Jest
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

#### Frontend

```bash
cd frontend
npm run dev          # Start Next.js development server
npm run build        # Production build
npm run start        # Start production server
npm run test         # Run unit tests (Jest + React Testing Library)
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier
```

### Using the Enterprise Assistant (MVP)

1. **Configure MCP Servers**: Update `mcp-servers.json` with your credentials
2. **Start the Application**: Launch backend and frontend
3. **Chat**: Ask questions about your enterprise data

## 🏗️ What's Next

### 🎯 Future Features (Post-MVP)

- **User Authentication**: JWT-based user sessions
- **Database Storage**: Persistent conversation history
- **Multi-LLM Support**: OpenAI, Local Ollama integration
- **Advanced Security**: Rate limiting, input validation
- **Team Collaboration**: Multi-user workspaces
- **Integrated MCP Management**: In-app server configuration

## 🧑‍💻 Behind The Code

### 🌈 Inspiration

enterprise-search was inspired by the need for a unified search experience across fragmented enterprise tools.
With the introduction of Anthropic's Model Context Protocol (MCP), we saw an opportunity to standardize how search queries interact with diverse data sources.

### 💡 Challenges/Learnings

- **Protocol Standardization**: Implementing MCP clients for consistent communication with various server types
- **Real-time Aggregation**: Efficiently combining and ranking results from multiple sources
- **Authentication Complexity**: Handling different auth methods across enterprise systems
- **Performance Optimization**: Ensuring fast response times when querying multiple MCP servers

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
