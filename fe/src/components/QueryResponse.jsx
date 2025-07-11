import { MessageSquare, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { formatPercentage, formatHours } from '../lib/utils';

const InsightCard = ({ icon: Icon, title, value, color = 'text-gray-600' }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <Icon className={`w-5 h-5 ${color}`} />
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-600">{value}</p>
    </div>
  </div>
);

const QueryResponse = ({ response, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-medium">Analyzing...</h3>
            <p className="text-sm text-gray-600">Processing your query</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const { query, type, summary, insights, data } = response;

  const getTypeIcon = () => {
    switch (type) {
      case 'availability':
        return Clock;
      case 'billability':
        return DollarSign;
      case 'team_overview':
        return Users;
      default:
        return TrendingUp;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'availability':
        return 'text-blue-600';
      case 'billability':
        return 'text-green-600';
      case 'team_overview':
        return 'text-purple-600';
      default:
        return 'text-primary-600';
    }
  };

  const TypeIcon = getTypeIcon();
  const typeColor = getTypeColor();

  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <TypeIcon className={`w-4 h-4 ${typeColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">Response to: "{query}"</h3>
          <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')} Analysis</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Summary</h4>
        <p className="text-gray-700">{summary}</p>
      </div>

      {insights && insights.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-3">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.map((insight, index) => (
              <InsightCard
                key={index}
                icon={TrendingUp}
                title={insight.split(':')[0]}
                value={insight.split(':')[1] || insight}
                color={typeColor}
              />
            ))}
          </div>
        </div>
      )}

      {data?.teamMetrics && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-primary-600">
                {data.teamMetrics.team.activeUsers}
              </p>
              <p className="text-xs text-gray-600">Active Users</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-600">
                {formatHours(data.teamMetrics.availability.totalPlannedHours)}
              </p>
              <p className="text-xs text-gray-600">Planned Hours</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {formatPercentage(data.teamMetrics.billability.overallBillabilityRate)}
              </p>
              <p className="text-xs text-gray-600">Billability</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-purple-600">
                {data.teamMetrics.insights.topPerformers.length}
              </p>
              <p className="text-xs text-gray-600">Top Performers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryResponse;