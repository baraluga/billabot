const TempoClient = require('./tempo-client');
const JiraClient = require('./jira-client');

class AnalysisService {
  constructor() {
    this.tempoClient = new TempoClient();
    this.jiraClient = new JiraClient();
  }

  // Enhanced team analysis with JIRA + Tempo integration
  async getEnhancedTeamAnalysis(dateRange = 7) {
    console.log(`🔍 Running enhanced team analysis for ${dateRange} days`);
    
    try {
      // Get Tempo data
      const tempoAnalysis = await this.tempoClient.analyzeTeam(dateRange);
      
      // Get all unique user IDs from Tempo data
      const userIds = Object.keys(tempoAnalysis.userAnalysis);
      
      // Get JIRA user details for these users
      const jiraUsers = await this.jiraClient.getUsersWithDetails(userIds);
      
      // Create a map of accountId -> user details
      const userMap = {};
      jiraUsers.forEach(user => {
        if (user && user.accountId) {
          userMap[user.accountId] = {
            accountId: user.accountId,
            displayName: user.displayName,
            emailAddress: user.emailAddress,
            avatarUrls: user.avatarUrls,
            active: user.active,
            timeZone: user.timeZone
          };
        }
      });
      
      // Enhance the analysis with JIRA user data
      const enhancedUserAnalysis = {};
      Object.entries(tempoAnalysis.userAnalysis).forEach(([userId, data]) => {
        enhancedUserAnalysis[userId] = {
          ...data,
          userInfo: userMap[userId] || {
            accountId: userId,
            displayName: `Unknown User (${userId.substring(0, 8)}...)`,
            emailAddress: null,
            active: true
          }
        };
      });
      
      // Calculate team metrics
      const teamMetrics = this.calculateTeamMetrics(enhancedUserAnalysis);
      
      return {
        ...tempoAnalysis,
        userAnalysis: enhancedUserAnalysis,
        teamMetrics,
        jiraIntegration: {
          usersEnriched: Object.keys(userMap).length,
          totalUsers: userIds.length,
          enrichmentRate: Math.round((Object.keys(userMap).length / userIds.length) * 100)
        }
      };
      
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error.message);
      throw error;
    }
  }

  calculateTeamMetrics(userAnalysis) {
    const users = Object.values(userAnalysis);
    const activeUsers = users.filter(u => u.userInfo.active !== false);
    
    // Availability metrics
    const totalPlannedHours = activeUsers.reduce((sum, u) => sum + u.availability.totalPlannedHours, 0);
    const avgPlannedHours = activeUsers.length > 0 ? totalPlannedHours / activeUsers.length : 0;
    
    // Billability metrics
    const totalLoggedHours = activeUsers.reduce((sum, u) => sum + u.billability.totalLoggedHours, 0);
    const totalBillableHours = activeUsers.reduce((sum, u) => sum + u.billability.billableHours, 0);
    const overallBillabilityRate = totalLoggedHours > 0 ? (totalBillableHours / totalLoggedHours) * 100 : 0;
    
    // Capacity analysis
    const highCapacityUsers = activeUsers.filter(u => u.availability.totalPlannedHours > avgPlannedHours * 1.2);
    const lowCapacityUsers = activeUsers.filter(u => u.availability.totalPlannedHours < avgPlannedHours * 0.5);
    
    // Billability analysis
    const highBillabilityUsers = activeUsers.filter(u => u.billability.billablePercentage > 75);
    const lowBillabilityUsers = activeUsers.filter(u => 
      u.billability.totalLoggedHours > 0 && u.billability.billablePercentage < 25
    );
    
    return {
      team: {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        inactiveUsers: users.length - activeUsers.length
      },
      availability: {
        totalPlannedHours: Math.round(totalPlannedHours * 100) / 100,
        avgPlannedHours: Math.round(avgPlannedHours * 100) / 100,
        highCapacityUsers: highCapacityUsers.length,
        lowCapacityUsers: lowCapacityUsers.length
      },
      billability: {
        totalLoggedHours: Math.round(totalLoggedHours * 100) / 100,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        overallBillabilityRate: Math.round(overallBillabilityRate),
        highBillabilityUsers: highBillabilityUsers.length,
        lowBillabilityUsers: lowBillabilityUsers.length
      },
      insights: {
        capacityStatus: this.getCapacityStatus(avgPlannedHours, activeUsers.length),
        billabilityStatus: this.getBillabilityStatus(overallBillabilityRate),
        topPerformers: this.getTopPerformers(activeUsers),
        needsAttention: this.getUsersNeedingAttention(activeUsers)
      }
    };
  }

  getCapacityStatus(avgPlannedHours, activeUsers) {
    if (avgPlannedHours > 35) return 'High capacity utilization';
    if (avgPlannedHours > 25) return 'Moderate capacity utilization';
    return 'Low capacity utilization';
  }

  getBillabilityStatus(rate) {
    if (rate > 75) return 'Excellent billability';
    if (rate > 50) return 'Good billability';
    if (rate > 25) return 'Fair billability';
    return 'Poor billability';
  }

  getTopPerformers(users) {
    return users
      .filter(u => u.billability.billablePercentage > 75 && u.billability.totalLoggedHours > 10)
      .sort((a, b) => b.billability.billablePercentage - a.billability.billablePercentage)
      .slice(0, 3)
      .map(u => ({
        name: u.userInfo.displayName,
        accountId: u.userInfo.accountId,
        billablePercentage: u.billability.billablePercentage,
        billableHours: u.billability.billableHours
      }));
  }

  getUsersNeedingAttention(users) {
    return users
      .filter(u => 
        (u.billability.totalLoggedHours > 0 && u.billability.billablePercentage < 25) ||
        (u.availability.totalPlannedHours > 0 && u.billability.totalLoggedHours === 0)
      )
      .map(u => ({
        name: u.userInfo.displayName,
        accountId: u.userInfo.accountId,
        issue: u.billability.totalLoggedHours === 0 ? 'No time logged' : 'Low billability',
        billablePercentage: u.billability.billablePercentage,
        loggedHours: u.billability.totalLoggedHours
      }));
  }

  // Smart query processing for natural language
  async processNaturalLanguageQuery(query) {
    console.log(`🧠 Processing query: "${query}"`);
    
    const lowerQuery = query.toLowerCase();
    
    // Determine query type and parameters
    let days = 7;
    const dayMatches = query.match(/(\d+)\s*(day|week|month)/i);
    if (dayMatches) {
      const num = parseInt(dayMatches[1]);
      const unit = dayMatches[2].toLowerCase();
      days = unit === 'week' ? num * 7 : unit === 'month' ? num * 30 : num;
    }
    
    // Get the enhanced analysis
    const analysis = await this.getEnhancedTeamAnalysis(days);
    
    // Generate response based on query intent
    if (lowerQuery.includes('available') || lowerQuery.includes('availability') || lowerQuery.includes('capacity')) {
      return this.generateAvailabilityResponse(analysis, query);
    } else if (lowerQuery.includes('billability') || lowerQuery.includes('billable')) {
      return this.generateBillabilityResponse(analysis, query);
    } else if (lowerQuery.includes('team') || lowerQuery.includes('overview')) {
      return this.generateTeamOverviewResponse(analysis, query);
    } else {
      return this.generateFullResponse(analysis, query);
    }
  }

  generateAvailabilityResponse(analysis, query) {
    const metrics = analysis.teamMetrics;
    return {
      query,
      type: 'availability',
      summary: `Team has ${metrics.availability.totalPlannedHours}h planned (${metrics.availability.avgPlannedHours}h avg per person). ${metrics.availability.highCapacityUsers} high-capacity, ${metrics.availability.lowCapacityUsers} low-capacity users.`,
      data: analysis,
      insights: [
        `Status: ${metrics.insights.capacityStatus}`,
        `${metrics.team.activeUsers} active team members`,
        `${metrics.availability.highCapacityUsers} users with high capacity utilization`,
        `${metrics.availability.lowCapacityUsers} users with low capacity utilization`
      ]
    };
  }

  generateBillabilityResponse(analysis, query) {
    const metrics = analysis.teamMetrics;
    return {
      query,
      type: 'billability',
      summary: `Team billability: ${metrics.billability.overallBillabilityRate}% (${metrics.billability.totalBillableHours}h/${metrics.billability.totalLoggedHours}h). ${metrics.billability.highBillabilityUsers} high-performers, ${metrics.billability.lowBillabilityUsers} need attention.`,
      data: analysis,
      insights: [
        `Status: ${metrics.insights.billabilityStatus}`,
        `Top performers: ${metrics.insights.topPerformers.length}`,
        `Users needing attention: ${metrics.insights.needsAttention.length}`,
        `Overall rate: ${metrics.billability.overallBillabilityRate}%`
      ]
    };
  }

  generateTeamOverviewResponse(analysis, query) {
    const metrics = analysis.teamMetrics;
    return {
      query,
      type: 'team_overview',
      summary: `Team: ${metrics.team.activeUsers} active users. Capacity: ${metrics.insights.capacityStatus}. Billability: ${metrics.insights.billabilityStatus} (${metrics.billability.overallBillabilityRate}%).`,
      data: analysis,
      insights: [
        `${metrics.team.totalUsers} total users (${metrics.team.activeUsers} active)`,
        `${metrics.availability.totalPlannedHours}h planned, ${metrics.billability.totalLoggedHours}h logged`,
        `${metrics.billability.overallBillabilityRate}% billability rate`,
        `${metrics.insights.topPerformers.length} top performers, ${metrics.insights.needsAttention.length} need attention`
      ]
    };
  }

  generateFullResponse(analysis, query) {
    return {
      query,
      type: 'full_analysis',
      summary: `Complete team analysis: ${analysis.teamMetrics.team.activeUsers} active users, ${analysis.teamMetrics.billability.overallBillabilityRate}% billability, ${analysis.teamMetrics.insights.capacityStatus.toLowerCase()}.`,
      data: analysis,
      insights: [
        `Team size: ${analysis.teamMetrics.team.activeUsers} active users`,
        `Capacity: ${analysis.teamMetrics.insights.capacityStatus}`,
        `Billability: ${analysis.teamMetrics.insights.billabilityStatus}`,
        `Data quality: ${analysis.jiraIntegration.enrichmentRate}% user enrichment`
      ]
    };
  }
}

module.exports = AnalysisService;