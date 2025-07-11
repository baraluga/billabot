import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error?.response?.status, error?.response?.data);
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Health check
  health: () => api.get('/health'),

  // Team analysis
  getTeamAnalysis: (days = 7) => api.get(`/api/team-analysis?days=${days}`),
  getEnhancedAnalysis: (days = 7) => api.get(`/api/enhanced-analysis?days=${days}`),
  
  // Natural language query
  queryTeam: (query) => api.post('/api/query', { query }),

  // Tempo endpoints
  getAvailability: (from, to) => api.get(`/api/availability?from=${from}&to=${to}`),
  getBillability: (from, to) => api.get(`/api/billability?from=${from}&to=${to}`),

  // JIRA endpoints
  getJiraUsers: (query = '', maxResults = 50) => 
    api.get(`/api/jira/users?query=${encodeURIComponent(query)}&maxResults=${maxResults}`),
  getJiraProjects: () => api.get('/api/jira/projects'),
  getJiraUser: (accountId) => api.get(`/api/jira/user/${accountId}`),
  getJiraTeamActivity: (projects = '', days = 30) => 
    api.get(`/api/jira/team-activity?projects=${projects}&days=${days}`),
};

export default api;