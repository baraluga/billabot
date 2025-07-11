import { Users, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { formatHours, formatPercentage } from '../lib/utils';

const MetricCard = ({ icon: Icon, label, value, subtext, color = 'text-gray-600' }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
  </div>
);

const TeamMetrics = ({ metrics, dateRange }) => {
  if (!metrics) return null;

  const { team, availability, billability, insights } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team Overview</h2>
        {dateRange && (
          <p className="text-sm text-gray-600">
            {dateRange.from} to {dateRange.to}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Active Users"
          value={`${team.activeUsers}/${team.totalUsers}`}
          subtext="team members"
          color="text-primary-600"
        />
        
        <MetricCard
          icon={Clock}
          label="Total Capacity"
          value={formatHours(availability.totalPlannedHours)}
          subtext={`${formatHours(availability.avgPlannedHours)} avg per person`}
          color="text-blue-600"
        />
        
        <MetricCard
          icon={DollarSign}
          label="Billability Rate"
          value={formatPercentage(billability.overallBillabilityRate)}
          subtext={`${formatHours(billability.totalBillableHours)} billable`}
          color="text-green-600"
        />
        
        <MetricCard
          icon={TrendingUp}
          label="Status"
          value={insights.capacityStatus.includes('High') ? 'High Load' : 'Optimal'}
          subtext={insights.billabilityStatus.toLowerCase()}
          color={insights.capacityStatus.includes('High') ? 'text-red-600' : 'text-green-600'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Capacity Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>High Capacity</span>
              <span className="font-medium">{availability.highCapacityUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Low Capacity</span>
              <span className="font-medium">{availability.lowCapacityUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Hours</span>
              <span className="font-medium">{formatHours(availability.avgPlannedHours)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Billability Insights</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>High Performers</span>
              <span className="font-medium text-green-600">{billability.highBillabilityUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Need Attention</span>
              <span className="font-medium text-red-600">{billability.lowBillabilityUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Logged</span>
              <span className="font-medium">{formatHours(billability.totalLoggedHours)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMetrics;