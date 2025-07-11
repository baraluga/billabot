import { MessageSquare, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { formatPercentage, formatHours } from '../lib/utils';

const MemberCard = ({ member, type }) => {
  const userInfo = member.userInfo || {};
  const displayName = userInfo.displayName || `User (${userInfo.accountId?.substring(0, 8) || 'Unknown'})`;
  const emailAddress = userInfo.emailAddress || '';
  
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary-600">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-gray-600">{emailAddress}</p>
        </div>
      </div>
      <div className="text-right">
        {type === 'availability' && (
          <>
            <p className="text-sm font-semibold text-blue-600">
              {formatHours(member.availability?.totalPlannedHours || 0)}
            </p>
            <p className="text-xs text-gray-600">planned hours</p>
          </>
        )}
        {type === 'billability' && (
          <>
            <p className="text-sm font-semibold text-green-600">
              {formatPercentage(member.billability?.billablePercentage || 0)}
            </p>
            <p className="text-xs text-gray-600">billable rate</p>
          </>
        )}
      </div>
    </div>
  );
};

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

      {/* Member-focused results for availability and billability */}
      {data?.userAnalysis && (type === 'availability' || type === 'billability') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">
              {type === 'availability' ? 'Team Availability' : 'Team Billability'}
            </h4>
            <div className="text-sm text-gray-500">
              {Object.values(data.userAnalysis).length} members
            </div>
          </div>
          <div className="relative">
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {Object.values(data.userAnalysis).map((member, index) => (
                <MemberCard
                  key={member.userInfo?.accountId || index}
                  member={member}
                  type={type}
                />
              ))}
            </div>
            {/* Scroll indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none opacity-75"></div>
            <div className="absolute top-0 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded-b-md shadow-sm">
              ↕ Scroll for more
            </div>
          </div>
        </div>
      )}

      {/* Generic insights for other query types */}
      {insights && insights.length > 0 && type !== 'availability' && type !== 'billability' && (
        <div className="mb-4">
          <h4 className="font-medium mb-3">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <TrendingUp className={`w-5 h-5 ${typeColor}`} />
                <div>
                  <p className="text-sm font-medium">{insight.split(':')[0]}</p>
                  <p className="text-xs text-gray-600">{insight.split(':')[1] || insight}</p>
                </div>
              </div>
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