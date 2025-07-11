# BillaBot 🤖

**JIRA + Tempo Team Analytics with MCP Integration**

A comprehensive fullstack application that integrates JIRA and Tempo APIs to provide detailed team availability and billability analysis through natural language queries.

## 🎯 Features

- **Team Analytics**: Comprehensive analysis of team availability and billability
- **Natural Language Queries**: Ask questions like "How is our team doing this week?"
- **JIRA Integration**: Access user and project data from JIRA
- **Tempo Integration**: Analyze availability (plans) and billability (worklogs) 
- **MCP Plugin**: Model Context Protocol integration for Claude Desktop
- **Modern UI**: React frontend with interactive charts and visualizations
- **Real-time Data**: Live updates and refresh capabilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Express)     │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • JIRA API      │
│ • Charts        │    │ • Enhanced      │    │ • Tempo API     │
│ • NL Queries    │    │   Analysis      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │   MCP Plugin    │
         └──────────────┤   (Claude)      │
                        │                 │
                        │ • 6 Tools       │
                        │ • NL Processing │
                        └─────────────────┘
```

## 📁 Project Structure

```
billabot/
├── be/                 # Backend (Express.js API)
│   ├── server.js       # Main server
│   ├── jira-client.js  # JIRA API client
│   ├── tempo-client.js # Tempo API client
│   └── analysis-service.js # Enhanced analysis
├── fe/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── lib/        # API client & utilities
│   │   └── App.jsx     # Main app
│   └── package.json
├── mcp-plugin/         # MCP Plugin for Claude Desktop
│   ├── index.js        # MCP server
│   └── package.json
└── CLAUDE.md           # Project documentation
```

## 🚀 Quick Start

### 1. Environment Setup

Create `.env` file in `be/` directory:
```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@domain.com
JIRA_API_TOKEN=your-jira-api-token
TEMPO_API_TOKEN=your-tempo-api-token
```

### 2. Backend Setup

```bash
cd be
npm install
npm start
```

Backend runs on http://localhost:3001

### 3. Frontend Setup

```bash
cd fe
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### 4. MCP Plugin Setup

```bash
cd mcp-plugin
npm install
npm start
```

For Claude Desktop integration, see `mcp-plugin/README.md`

## 📊 API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /api/enhanced-analysis?days=7` - Enhanced team analysis
- `POST /api/query` - Natural language queries

### JIRA Endpoints
- `GET /api/jira/users` - Get JIRA users
- `GET /api/jira/projects` - Get JIRA projects
- `GET /api/jira/user/:accountId` - Get specific user

### Tempo Endpoints
- `GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` - Team availability
- `GET /api/billability?from=YYYY-MM-DD&to=YYYY-MM-DD` - Team billability

## 🎨 Frontend Features

### Dashboard
- **Team Metrics**: Overview of capacity and billability
- **Interactive Charts**: Bar charts, pie charts, scatter plots
- **User Management**: Search, filter, and sort team members
- **Real-time Updates**: Auto-refresh every 5 minutes

### Natural Language Interface
Ask questions like:
- "How is our team doing this week?"
- "Who has the highest billability?"
- "What's our capacity utilization?"
- "Show me users who need attention"

## 🔧 MCP Plugin Tools

The MCP plugin provides 6 tools for Claude Desktop:

1. **analyze_team** - Comprehensive team analysis
2. **query_team** - Natural language queries
3. **get_team_availability** - Availability data
4. **get_team_billability** - Billability data
5. **get_jira_users** - JIRA user search
6. **get_jira_projects** - JIRA projects list

## 📈 System Status

- ✅ **Epic 1**: JIRA API Integration - COMPLETED
- ✅ **Epic 2**: Tempo API Integration - COMPLETED  
- ✅ **Epic 3**: MCP Plugin Development - COMPLETED
- ✅ **Epic 4**: Frontend - COMPLETED
- ⏳ **Epic 5**: Deployment & Documentation - IN PROGRESS

## 🧪 Testing

Test the system integration:
```bash
# Health check
curl http://localhost:3001/health

# Team analysis
curl "http://localhost:3001/api/enhanced-analysis?days=7"

# Natural language query
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How is our team doing this week?"}'
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Axios
- **Frontend**: React, Vite, Tailwind CSS, React Query, Recharts
- **MCP**: Model Context Protocol SDK
- **APIs**: JIRA REST API, Tempo API
- **Tools**: Lucide React (icons), Headless UI

## 📝 License

This project is for internal use and integrates with JIRA and Tempo APIs.

---

**Built with ❤️ for better team analytics**