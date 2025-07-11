#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '../be/.env' });

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

class BillaBotMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'billabot-mcp-plugin',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_team',
            description: 'Analyze team availability and billability over a specified period',
            inputSchema: {
              type: 'object',
              properties: {
                days: {
                  type: 'number',
                  description: 'Number of days to analyze (default: 7)',
                  default: 7,
                  minimum: 1,
                  maximum: 365
                }
              },
              additionalProperties: false
            },
          },
          {
            name: 'query_team',
            description: 'Ask natural language questions about team performance, availability, and billability',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Natural language question about the team (e.g., "How is our team doing this week?", "Who has the highest billability?", "What is our capacity utilization?")'
                }
              },
              required: ['query'],
              additionalProperties: false
            },
          },
          {
            name: 'get_team_availability',
            description: 'Get detailed team availability data from Tempo Planner',
            inputSchema: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  description: 'Start date in YYYY-MM-DD format',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                },
                to: {
                  type: 'string',
                  description: 'End date in YYYY-MM-DD format',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                }
              },
              required: ['from', 'to'],
              additionalProperties: false
            },
          },
          {
            name: 'get_team_billability',
            description: 'Get detailed team billability data from Tempo Timesheets',
            inputSchema: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  description: 'Start date in YYYY-MM-DD format',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                },
                to: {
                  type: 'string',
                  description: 'End date in YYYY-MM-DD format',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                }
              },
              required: ['from', 'to'],
              additionalProperties: false
            },
          },
          {
            name: 'get_jira_users',
            description: 'Search and retrieve JIRA users',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for users (optional)',
                  default: ''
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 50,
                  minimum: 1,
                  maximum: 100
                }
              },
              additionalProperties: false
            },
          },
          {
            name: 'get_jira_projects',
            description: 'Get list of JIRA projects',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false
            },
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_team':
            return await this.handleAnalyzeTeam(args);
          case 'query_team':
            return await this.handleQueryTeam(args);
          case 'get_team_availability':
            return await this.handleGetAvailability(args);
          case 'get_team_billability':
            return await this.handleGetBillability(args);
          case 'get_jira_users':
            return await this.handleGetJiraUsers(args);
          case 'get_jira_projects':
            return await this.handleGetJiraProjects(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async handleAnalyzeTeam(args) {
    const { days = 7 } = args;
    const response = await fetch(`${BACKEND_URL}/api/enhanced-analysis?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the response for MCP
    const summary = this.formatTeamAnalysisSummary(data);
    
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  }

  async handleQueryTeam(args) {
    const { query } = args;
    const response = await fetch(`${BACKEND_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the response for MCP
    const formatted = this.formatQueryResponse(data);
    
    return {
      content: [
        {
          type: 'text',
          text: formatted,
        },
      ],
    };
  }

  async handleGetAvailability(args) {
    const { from, to } = args;
    const response = await fetch(`${BACKEND_URL}/api/availability?from=${from}&to=${to}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: `Team Availability (${from} to ${to}):\\n\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async handleGetBillability(args) {
    const { from, to } = args;
    const response = await fetch(`${BACKEND_URL}/api/billability?from=${from}&to=${to}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: `Team Billability (${from} to ${to}):\\n\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async handleGetJiraUsers(args) {
    const { query = '', maxResults = 50 } = args;
    const response = await fetch(`${BACKEND_URL}/api/jira/users?query=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: `JIRA Users${query ? ` (search: "${query}")` : ''}:\\n\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async handleGetJiraProjects(args) {
    const response = await fetch(`${BACKEND_URL}/api/jira/projects`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: `JIRA Projects:\\n\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  formatTeamAnalysisSummary(data) {
    const { teamMetrics, dateRange, summary } = data;
    
    return `# Team Analysis Report (${dateRange.from} to ${dateRange.to})

## 📊 Summary
${summary.totalUsers} users analyzed | ${summary.totalPlans} plans | ${summary.totalWorklogs} worklogs

## 👥 Team Metrics
- **Active Users**: ${teamMetrics.team.activeUsers}/${teamMetrics.team.totalUsers}
- **Capacity Status**: ${teamMetrics.insights.capacityStatus}
- **Billability Status**: ${teamMetrics.insights.billabilityStatus}

## 📈 Availability
- **Total Planned**: ${teamMetrics.availability.totalPlannedHours}h
- **Average per Person**: ${teamMetrics.availability.avgPlannedHours}h
- **High Capacity Users**: ${teamMetrics.availability.highCapacityUsers}
- **Low Capacity Users**: ${teamMetrics.availability.lowCapacityUsers}

## 💰 Billability
- **Total Logged**: ${teamMetrics.billability.totalLoggedHours}h
- **Total Billable**: ${teamMetrics.billability.totalBillableHours}h
- **Billability Rate**: ${teamMetrics.billability.overallBillabilityRate}%
- **High Performers**: ${teamMetrics.billability.highBillabilityUsers}
- **Need Attention**: ${teamMetrics.billability.lowBillabilityUsers}

## 🌟 Top Performers
${teamMetrics.insights.topPerformers.map(p => 
  `- **${p.name}**: ${p.billablePercentage}% billable (${p.billableHours}h)`
).join('\\n')}

## ⚠️ Users Needing Attention
${teamMetrics.insights.needsAttention.map(u => 
  `- **${u.name}**: ${u.issue} (${u.billablePercentage}% billable, ${u.loggedHours}h logged)`
).join('\\n')}

## 🔗 Data Quality
- **JIRA Integration**: ${data.jiraIntegration.enrichmentRate}% user data enriched
- **Users Enriched**: ${data.jiraIntegration.usersEnriched}/${data.jiraIntegration.totalUsers}`;
  }

  formatQueryResponse(data) {
    const { query, type, summary, insights } = data;
    
    return `# Query Response: "${query}"

## 📋 Summary
${summary}

## 💡 Key Insights
${insights.map(insight => `- ${insight}`).join('\\n')}

## 📊 Analysis Type
${type.replace('_', ' ').toUpperCase()}

---
*Use 'analyze_team' for detailed analysis or ask another question about the team.*`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('BillaBot MCP Plugin started successfully');
  }
}

const server = new BillaBotMCPServer();
server.run().catch(console.error);