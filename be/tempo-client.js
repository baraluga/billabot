require('dotenv').config();

class TempoClient {
  constructor() {
    this.baseURL = 'https://api.tempo.io/4';
    this.token = process.env.TEMPO_API_TOKEN;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`❌ Error calling ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Get availability data (plans)
  async getAvailability(from, to) {
    console.log(`📅 Getting availability from ${from} to ${to}`);
    return await this.makeRequest('/plans', { from, to });
  }

  // Get billability data (worklogs)
  async getBillability(from, to) {
    console.log(`💰 Getting billability from ${from} to ${to}`);
    return await this.makeRequest('/worklogs', { from, to });
  }

  // Get user info by account ID
  async getUserByAccountId(accountId) {
    console.log(`👤 Getting user info for ${accountId}`);
    return await this.makeRequest(`/users/${accountId}`);
  }

  // Analyze team availability and billability
  async analyzeTeam(dateRange = 7) {
    const today = new Date();
    const fromDate = new Date(today.getTime() - dateRange * 24 * 60 * 60 * 1000);
    const toDate = today;
    
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];
    
    console.log(`🔍 Analyzing team data from ${from} to ${to}\n`);
    
    try {
      const [plans, worklogs] = await Promise.all([
        this.getAvailability(from, to),
        this.getBillability(from, to)
      ]);
      
      // Process availability data
      const availabilityByUser = {};
      plans.results.forEach(plan => {
        const userId = plan.assignee.id;
        if (!availabilityByUser[userId]) {
          availabilityByUser[userId] = {
            totalPlannedSeconds: 0,
            plans: []
          };
        }
        availabilityByUser[userId].totalPlannedSeconds += plan.totalPlannedSecondsInScope || 0;
        availabilityByUser[userId].plans.push(plan);
      });
      
      // Process billability data
      const billabilityByUser = {};
      worklogs.results.forEach(worklog => {
        const userId = worklog.author.accountId;
        if (!billabilityByUser[userId]) {
          billabilityByUser[userId] = {
            totalSeconds: 0,
            billableSeconds: 0,
            worklogs: []
          };
        }
        billabilityByUser[userId].totalSeconds += worklog.timeSpentSeconds;
        billabilityByUser[userId].billableSeconds += worklog.billableSeconds;
        billabilityByUser[userId].worklogs.push(worklog);
      });
      
      // Combine and analyze
      const analysis = {
        dateRange: { from, to },
        summary: {
          totalUsers: Object.keys({...availabilityByUser, ...billabilityByUser}).length,
          totalPlans: plans.results.length,
          totalWorklogs: worklogs.results.length
        },
        userAnalysis: {}
      };
      
      // Merge user data
      const allUsers = new Set([...Object.keys(availabilityByUser), ...Object.keys(billabilityByUser)]);
      
      for (const userId of allUsers) {
        const availability = availabilityByUser[userId] || { totalPlannedSeconds: 0, plans: [] };
        const billability = billabilityByUser[userId] || { totalSeconds: 0, billableSeconds: 0, worklogs: [] };
        
        analysis.userAnalysis[userId] = {
          availability: {
            totalPlannedHours: Math.round(availability.totalPlannedSeconds / 3600 * 100) / 100,
            planCount: availability.plans.length
          },
          billability: {
            totalLoggedHours: Math.round(billability.totalSeconds / 3600 * 100) / 100,
            billableHours: Math.round(billability.billableSeconds / 3600 * 100) / 100,
            billablePercentage: billability.totalSeconds > 0 ? 
              Math.round((billability.billableSeconds / billability.totalSeconds) * 100) : 0,
            worklogCount: billability.worklogs.length
          }
        };
      }
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }
}

module.exports = TempoClient;