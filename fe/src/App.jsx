import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, RefreshCw, AlertCircle, Calendar, BarChart3 } from 'lucide-react';
import { apiClient } from './lib/api';
import { getErrorMessage } from './lib/utils';

// Components
import QueryInput from './components/QueryInput';
import QueryResponse from './components/QueryResponse';
import TeamMetrics from './components/TeamMetrics';
import UserList from './components/UserList';
import { BillabilityChart, CapacityChart, TeamDistributionChart, EfficiencyScatterChart } from './components/Charts';

const ErrorBanner = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <div className="flex-1">
        <h3 className="font-medium text-red-800">Connection Error</h3>
        <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
      </div>
      <button 
        onClick={onRetry}
        className="btn-secondary text-sm"
      >
        <RefreshCw className="w-4 h-4 mr-1" />
        Retry
      </button>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

const App = () => {
  const [queryResponse, setQueryResponse] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enhanced team analysis
  const { 
    data: analysisData, 
    error, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['enhanced-analysis', days],
    queryFn: () => apiClient.getEnhancedAnalysis(days),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });

  const analysis = analysisData?.data;

  // Handle natural language query
  const handleQuery = async (query) => {
    setIsQuerying(true);
    try {
      const response = await apiClient.queryTeam(query);
      setQueryResponse(response.data);
    } catch (error) {
      console.error('Query error:', error);
      setQueryResponse({
        query,
        type: 'error',
        summary: `Failed to process query: ${getErrorMessage(error)}`,
        insights: ['Please try again or check your connection'],
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Calendar },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">BillaBot</h1>
              <span className="text-sm text-gray-500">Team Analytics</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="days" className="text-sm font-medium text-gray-700">
                  Days:
                </label>
                <select
                  id="days"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="input-field py-1 px-2 text-sm w-20"
                >
                  <option value={7}>7</option>
                  <option value={14}>14</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                  <option value={90}>90</option>
                </select>
              </div>
              
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="btn-secondary text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <ErrorBanner error={error} onRetry={() => refetch()} />
        )}

        {/* Query Input */}
        <div className="mb-8">
          <QueryInput onSubmit={handleQuery} isLoading={isQuerying} />
        </div>

        {/* Query Response */}
        {(queryResponse || isQuerying) && (
          <div className="mb-8">
            <QueryResponse response={queryResponse} isLoading={isQuerying} />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {isLoading && !analysis ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                <TeamMetrics 
                  metrics={analysis?.teamMetrics} 
                  dateRange={analysis?.dateRange}
                />
                {analysis?.userAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TeamDistributionChart teamMetrics={analysis.teamMetrics} />
                    <BillabilityChart userAnalysis={analysis.userAnalysis} />
                  </div>
                )}
              </>
            )}

            {activeTab === 'team' && (
              <UserList userAnalysis={analysis?.userAnalysis} />
            )}

            {activeTab === 'charts' && analysis?.userAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BillabilityChart userAnalysis={analysis.userAnalysis} />
                <CapacityChart userAnalysis={analysis.userAnalysis} />
                <TeamDistributionChart teamMetrics={analysis.teamMetrics} />
                <EfficiencyScatterChart userAnalysis={analysis.userAnalysis} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>BillaBot - JIRA + Tempo Team Analytics</p>
            <p className="mt-1">
              {analysis?.jiraIntegration && (
                `${analysis.jiraIntegration.enrichmentRate}% user data enriched • `
              )}
              {analysis?.summary && (
                `${analysis.summary.totalUsers} users • ${analysis.summary.totalPlans} plans • ${analysis.summary.totalWorklogs} worklogs`
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;