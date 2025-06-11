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

enterprise-search is a web application that allows teams to search across multiple enterprise systems (Slack, Jira, Confluence, GitHub, Bitbucket) through a unified interface powered by Model Context Protocol (MCP) servers.

## ✨ Features

- **Unified Search Interface**: Single search bar to query multiple enterprise systems
- **MCP Server Integration**: Leverages Model Context Protocol for standardized data access
- **Multi-Platform Support**: Slack, Jira, Confluence, GitHub, Bitbucket, and more
- **Configurable Connections**: Easy setup of MCP servers through settings modal
- **Real-time Results**: Fast, aggregated search results with source attribution
- **Context-Rich Display**: Results include relevant metadata and source links
- **Search History**: Track and revisit previous searches
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## ⚡ Setup

### ⚙️ Requirements

- Node.js >= 18.0.0
- npm or yarn
- Docker (optional, for MCP server deployment)

### 💻 Installation

```bash
git clone https://github.com/2kabhishek/enterprise-search
cd enterprise-search
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### 🔧 Environment Setup

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# MCP Server Configurations (optional defaults)
DEFAULT_MCP_SERVERS='[
  {
    "name": "Jira",
    "endpoint": "http://localhost:3001",
    "type": "jira",
    "enabled": true
  },
  {
    "name": "Confluence", 
    "endpoint": "http://localhost:3002",
    "type": "confluence",
    "enabled": true
  }
]'

# Security
JWT_SECRET="your-jwt-secret-here"
```

## 🚀 Usage

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Run tests
npm test
npm run test:e2e
```

### Configuring MCP Servers

1. Click the **settings gear icon** in the top-right corner
2. Add your MCP server configurations in the textarea modal:

```json
[
  {
    "name": "Company Jira",
    "endpoint": "https://your-company.atlassian.net/mcp",
    "type": "jira",
    "enabled": true,
    "auth": {
      "type": "bearer",
      "token": "your-api-token"
    }
  },
  {
    "name": "GitHub Enterprise",
    "endpoint": "https://github.your-company.com/mcp",
    "type": "github", 
    "enabled": true,
    "auth": {
      "type": "token",
      "token": "ghp_your_token"
    }
  }
]
```

3. Save the configuration and start searching!

### Searching

- Type your query in the main search bar
- Results appear in real-time from all configured MCP servers
- Click on results to view full context and source links
- Use filters to narrow down results by source or type

## Getting Started (Development)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🏗️ What's Next

### ✅ To-Do

- [x] Research Model Context Protocol (MCP)
- [x] Design application architecture  
- [x] Choose tech stack (Next.js + TypeScript)
- [x] Set up project structure and dependencies
- [x] Implement MCP client using official SDK
- [x] Build search interface with real-time results
- [x] Create settings modal for MCP server configuration
- [x] Add result aggregation and ranking
- [x] Add comprehensive testing suite
- [ ] Implement authentication and security
- [ ] Deploy and document deployment process

### 🎯 Planned Features

- **Advanced Filtering**: Filter by date, source, content type
- **Search Analytics**: Track popular queries and usage patterns  
- **Saved Searches**: Bookmark and organize frequent searches
- **Team Collaboration**: Share search results and configurations
- **API Access**: REST API for integrating with other tools
- **SSO Integration**: Enterprise authentication support

## 🧑‍💻 Behind The Code

### 🌈 Inspiration

enterprise-search was inspired by the need for a unified search experience across fragmented enterprise tools. With the introduction of Anthropic's Model Context Protocol (MCP), we saw an opportunity to standardize how search queries interact with diverse data sources.

### 💡 Challenges/Learnings

- **Protocol Standardization**: Implementing MCP clients for consistent communication with various server types
- **Real-time Aggregation**: Efficiently combining and ranking results from multiple sources
- **Authentication Complexity**: Handling different auth methods across enterprise systems
- **Performance Optimization**: Ensuring fast response times when querying multiple MCP servers

### 🧰 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **MCP Integration**: Official @modelcontextprotocol/sdk with SSE transport
- **Testing**: Jest, React Testing Library, Playwright
- **Development**: ESLint, Prettier, TypeScript strict mode
- **Build**: Turbopack for fast development, Next.js optimized production builds

### 🔍 MCP Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io/) — Official MCP specification
- [Anthropic MCP Guide](https://docs.anthropic.com/en/docs/build-with-claude/mcp) — Implementation guide
- [MCP GitHub Repository](https://github.com/modelcontextprotocol) — Reference implementations
- [Atlassian MCP Server](https://github.com/sooperset/mcp-atlassian) — Jira/Confluence integration

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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