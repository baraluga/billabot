# BillaBot MCP Plugin

Model Context Protocol (MCP) plugin for BillaBot - JIRA + Tempo team analysis integration.

## Features

- **Team Analysis**: Comprehensive team availability and billability analysis
- **Natural Language Queries**: Ask questions about team performance in plain English
- **JIRA Integration**: Access user and project data from JIRA
- **Tempo Integration**: Analyze availability (plans) and billability (worklogs)
- **Smart Insights**: Automated insights about team performance and capacity

## Available Tools

### 1. `analyze_team`
Analyze team availability and billability over a specified period.

```
Parameters:
- days (optional): Number of days to analyze (default: 7, max: 365)
```

### 2. `query_team`
Ask natural language questions about team performance.

```
Parameters:
- query (required): Natural language question

Examples:
- "How is our team doing this week?"
- "Who has the highest billability?"
- "What is our capacity utilization?"
- "Show me users who need attention"
```

### 3. `get_team_availability`
Get detailed team availability data from Tempo Planner.

```
Parameters:
- from (required): Start date (YYYY-MM-DD)
- to (required): End date (YYYY-MM-DD)
```

### 4. `get_team_billability`
Get detailed team billability data from Tempo Timesheets.

```
Parameters:
- from (required): Start date (YYYY-MM-DD)
- to (required): End date (YYYY-MM-DD)
```

### 5. `get_jira_users`
Search and retrieve JIRA users.

```
Parameters:
- query (optional): Search query for users
- maxResults (optional): Maximum results (default: 50, max: 100)
```

### 6. `get_jira_projects`
Get list of JIRA projects.

```
Parameters: None
```

## Setup

1. **Prerequisites**: Ensure BillaBot backend is running on `http://localhost:3001`

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the MCP server**:
   ```bash
   npm start
   ```

## Claude Desktop Integration

To use with Claude Desktop, add this configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "billabot": {
      "command": "node",
      "args": ["/path/to/billabot/mcp-plugin/index.js"],
      "env": {
        "BACKEND_URL": "http://localhost:3001"
      }
    }
  }
}
```

## Example Usage

Once integrated with Claude Desktop, you can ask questions like:

- "Analyze our team performance for the last 2 weeks"
- "Show me who has low billability this month"
- "What's our overall capacity utilization?"
- "Who are our top performers?"
- "Which users need attention?"

The plugin will automatically call the appropriate backend APIs and provide structured, human-readable responses.

## Development

For development with auto-restart:
```bash
npm run dev
```

## Environment Variables

- `BACKEND_URL`: URL of the BillaBot backend API (default: http://localhost:3001)