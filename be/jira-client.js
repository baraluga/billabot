require('dotenv').config();

class JiraClient {
  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL;
    this.email = process.env.JIRA_EMAIL;
    this.token = process.env.JIRA_API_TOKEN;
    this.auth = Buffer.from(`${this.email}:${this.token}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}/rest/api/2${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`❌ Error calling JIRA ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Get current user info
  async getCurrentUser() {
    console.log('👤 Getting current JIRA user');
    return await this.makeRequest('/myself');
  }

  // Search users
  async searchUsers(query = '', maxResults = 50) {
    console.log(`🔍 Searching JIRA users: "${query}"`);
    return await this.makeRequest('/user/search', { 
      query, 
      maxResults,
      includeInactive: false 
    });
  }

  // Get all users (paginated)
  async getAllUsers(maxResults = 100) {
    console.log('👥 Getting all JIRA users');
    return await this.makeRequest('/users/search', { 
      maxResults,
      includeInactive: false 
    });
  }

  // Get user by account ID
  async getUserByAccountId(accountId) {
    console.log(`👤 Getting JIRA user: ${accountId}`);
    return await this.makeRequest(`/user`, { accountId });
  }

  // Get projects
  async getProjects() {
    console.log('📁 Getting JIRA projects');
    return await this.makeRequest('/project');
  }

  // Search issues with JQL
  async searchIssues(jql, maxResults = 50) {
    console.log(`🔍 Searching issues: ${jql}`);
    return await this.makeRequest('/search', { 
      jql, 
      maxResults,
      fields: 'summary,assignee,status,project,worklog'
    });
  }

  // Get issue worklogs
  async getIssueWorklogs(issueKey) {
    console.log(`📝 Getting worklogs for issue: ${issueKey}`);
    return await this.makeRequest(`/issue/${issueKey}/worklog`);
  }

  // Enhanced user search with detailed info
  async getUsersWithDetails(accountIds = []) {
    console.log('🔍 Getting detailed user information');
    
    if (accountIds.length === 0) {
      // Get all users if no specific IDs provided
      const users = await this.getAllUsers();
      return users;
    }
    
    // Get specific users by account ID
    const userPromises = accountIds.map(id => 
      this.getUserByAccountId(id).catch(err => {
        console.warn(`⚠️ Could not fetch user ${id}:`, err.message);
        return null;
      })
    );
    
    const users = await Promise.all(userPromises);
    return users.filter(user => user !== null);
  }

  // Get team activity summary
  async getTeamActivity(projectKeys = [], days = 30) {
    console.log(`📊 Getting team activity for last ${days} days`);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const jqlDate = startDate.toISOString().split('T')[0];
    
    let jql = `worklogDate >= "${jqlDate}"`;
    if (projectKeys.length > 0) {
      jql += ` AND project IN (${projectKeys.map(k => `"${k}"`).join(',')})`;
    }
    
    return await this.searchIssues(jql, 100);
  }
}

module.exports = JiraClient;