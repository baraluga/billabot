require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const TempoClient = require('./tempo-client');
const JiraClient = require('./jira-client');
const AnalysisService = require('./analysis-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize clients
const tempoClient = new TempoClient();
const jiraClient = new JiraClient();
const analysisService = new AnalysisService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/availability', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Missing required parameters: from, to (YYYY-MM-DD format)' 
      });
    }
    
    const data = await tempoClient.getAvailability(from, to);
    res.json(data);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability data' });
  }
});

app.get('/api/billability', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Missing required parameters: from, to (YYYY-MM-DD format)' 
      });
    }
    
    const data = await tempoClient.getBillability(from, to);
    res.json(data);
  } catch (error) {
    console.error('Error fetching billability:', error);
    res.status(500).json({ error: 'Failed to fetch billability data' });
  }
});

app.get('/api/team-analysis', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const dateRange = parseInt(days);
    
    if (isNaN(dateRange) || dateRange < 1 || dateRange > 365) {
      return res.status(400).json({ 
        error: 'Invalid days parameter: must be a number between 1 and 365' 
      });
    }
    
    const analysis = await tempoClient.analyzeTeam(dateRange);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing team:', error);
    res.status(500).json({ error: 'Failed to analyze team data' });
  }
});

// JIRA API Routes
app.get('/api/jira/users', async (req, res) => {
  try {
    const { query = '', maxResults = 50 } = req.query;
    const users = query ? 
      await jiraClient.searchUsers(query, maxResults) :
      await jiraClient.getAllUsers(maxResults);
    res.json(users);
  } catch (error) {
    console.error('Error fetching JIRA users:', error);
    res.status(500).json({ error: 'Failed to fetch JIRA users' });
  }
});

app.get('/api/jira/projects', async (req, res) => {
  try {
    const projects = await jiraClient.getProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching JIRA projects:', error);
    res.status(500).json({ error: 'Failed to fetch JIRA projects' });
  }
});

app.get('/api/jira/user/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await jiraClient.getUserByAccountId(accountId);
    res.json(user);
  } catch (error) {
    console.error('Error fetching JIRA user:', error);
    res.status(500).json({ error: 'Failed to fetch JIRA user' });
  }
});

app.get('/api/jira/team-activity', async (req, res) => {
  try {
    const { projects = '', days = 30 } = req.query;
    const projectKeys = projects ? projects.split(',').map(p => p.trim()) : [];
    const activity = await jiraClient.getTeamActivity(projectKeys, parseInt(days));
    res.json(activity);
  } catch (error) {
    console.error('Error fetching team activity:', error);
    res.status(500).json({ error: 'Failed to fetch team activity' });
  }
});

// Enhanced Analysis Routes
app.get('/api/enhanced-analysis', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const analysis = await analysisService.getEnhancedTeamAnalysis(parseInt(days));
    res.json(analysis);
  } catch (error) {
    console.error('Error in enhanced analysis:', error);
    res.status(500).json({ error: 'Failed to perform enhanced analysis' });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const response = await analysisService.processNaturalLanguageQuery(query);
    res.json(response);
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BillaBot API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Team analysis: http://localhost:${PORT}/api/team-analysis?days=7`);
});

module.exports = app;