import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { formatHours, formatPercentage } from '../lib/utils';

const COLORS = ['#007acd', '#0062a4', '#004a7b', '#003152', '#001929'];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const BillabilityChart = ({ userAnalysis }) => {
  if (!userAnalysis) return null;

  const data = Object.entries(userAnalysis)
    .map(([userId, userData]) => ({
      name: userData.userInfo.displayName || 'Unknown',
      billablePercentage: userData.billability.billablePercentage,
      billableHours: userData.billability.billableHours,
      totalHours: userData.billability.totalLoggedHours,
    }))
    .filter(item => item.totalHours > 0)
    .sort((a, b) => b.billablePercentage - a.billablePercentage)
    .slice(0, 10);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Top 10 Billability Performers</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip formatter={formatPercentage} />} />
          <Bar dataKey="billablePercentage" fill="#007acd" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CapacityChart = ({ userAnalysis }) => {
  if (!userAnalysis) return null;

  const data = Object.entries(userAnalysis)
    .map(([userId, userData]) => ({
      name: userData.userInfo.displayName || 'Unknown',
      plannedHours: userData.availability.totalPlannedHours,
      loggedHours: userData.billability.totalLoggedHours,
    }))
    .filter(item => item.plannedHours > 0 || item.loggedHours > 0)
    .sort((a, b) => b.plannedHours - a.plannedHours)
    .slice(0, 10);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Capacity vs Actual Hours</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip formatter={formatHours} />} />
          <Legend />
          <Bar dataKey="plannedHours" fill="#007acd" name="Planned Hours" radius={[4, 4, 0, 0]} />
          <Bar dataKey="loggedHours" fill="#0062a4" name="Logged Hours" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TeamDistributionChart = ({ teamMetrics }) => {
  if (!teamMetrics) return null;

  const data = [
    { name: 'High Billability', value: teamMetrics.billability.highBillabilityUsers },
    { name: 'Low Billability', value: teamMetrics.billability.lowBillabilityUsers },
    { name: 'Others', value: teamMetrics.team.activeUsers - teamMetrics.billability.highBillabilityUsers - teamMetrics.billability.lowBillabilityUsers }
  ].filter(item => item.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Team Performance Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const EfficiencyScatterChart = ({ userAnalysis }) => {
  if (!userAnalysis) return null;

  const data = Object.entries(userAnalysis)
    .map(([userId, userData]) => ({
      name: userData.userInfo.displayName || 'Unknown',
      billablePercentage: userData.billability.billablePercentage,
      totalHours: userData.billability.totalLoggedHours,
      plannedHours: userData.availability.totalPlannedHours,
    }))
    .filter(item => item.totalHours > 0);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Efficiency Analysis</h3>
      <p className="text-sm text-gray-600 mb-4">Billability % vs Total Hours Logged</p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="totalHours" 
            type="number" 
            domain={[0, 'dataMax + 5']}
            name="Total Hours"
          />
          <YAxis 
            dataKey="billablePercentage" 
            type="number" 
            domain={[0, 100]}
            name="Billability %"
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p>Hours: {formatHours(data.totalHours)}</p>
                    <p>Billability: {formatPercentage(data.billablePercentage)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter 
            data={data} 
            fill="#007acd"
            r={6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};