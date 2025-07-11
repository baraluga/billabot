Here’s a detailed summary of your JIRA + Tempo + MCP Integration side project based on everything so far:

⸻

🧩 Project Name (Working): jira-tempo-agent

A fullstack integration project designed to extract and analyze team availability and billability data by integrating:
	•	JIRA REST API
	•	Tempo Planner + Timesheets APIs
	•	MCP (Model Context Protocol)
	•	Optionally, a frontend or Slack-based UI for interaction

⸻

🎯 End Goal

To build an MCP plugin agent (and optionally a UI) that enables users—via natural language prompts or API calls—to:

✅ Determine team availability

Based on Tempo Planner data:

	•	Who has capacity?
	•	Who is unassigned or lightly booked?

✅ Determine team billability

Based on Tempo Timesheets data:

	•	What % of a member’s logged time is billable?
	•	Are members spending time on internal or client work?

The result should be structured JSON (for MCP/automation) and/or text/markdown summaries (for user-facing feedback or Slack replies).

⸻

🛠️ Technology Stack
	•	Backend: Node.js + TypeScript
	•	Plugin Interface: MCP function manifest + handler
	•	APIs:
	•	JIRA REST API (/users, /projects, /search, /worklog)
	•	Tempo API (/plans, /worklogs, /users)
	•	Frontend (optional): React or Angular UI to visualize availability/billability
	•	Auth:
	•	JIRA: Email + API Token (Basic Auth)
	•	Tempo: OAuth 2.0 (Client Credentials Flow)

⸻

📐 System Architecture (High-Level)

User Query (UI or Slack)
        ↓
  MCP Router (GenAI)
        ↓
jira-tempo-agent Plugin
        ↓
JIRA API + Tempo APIs
        ↓
Structured JSON Output + Summary


⸻

🧱 Tasks and Milestones (Scrum Format)

🧱 Epic 1: JIRA API Integration
	•	Verify JIRA REST API access using Basic Auth
	•	Test endpoints:
	•	/myself
	•	/users/search
	•	/project/search
	•	/search?jql=...
	•	/issue/{issueKey}/worklog
	•	 Create jiraClient.ts to encapsulate fetch logic

⸻

🧱 Epic 2: Tempo API Integration
	• Register OAuth 2.0 App on https://app.tempo.io/settings/api-integration
	•	Generate access token via client_credentials grant
	•	⏳ Test endpoints:
	•	/plans – to determine availability
	•	/worklogs/user/{id} – to determine billability
	•	/users – to match accountId ↔ name

⸻

🧱 Epic 3: MCP Plugin Development
	•	⏳ Define MCP function manifest
	•	Inputs: team/user, date range, filters
	•	Outputs: availability %, billable %, per-user breakdown
	•	⏳ Implement handler logic to:
	•	Fetch JIRA user + project context
	•	Query Tempo plans + worklogs
	•	Calculate and format summaries
	•	⏳ Add error handling and edge case support

⸻

🧱 Epic 4: Frontend
	•	⏳ Simple UI to:
	•	Accept natural language query
	•	Display markdown/table/chart output

