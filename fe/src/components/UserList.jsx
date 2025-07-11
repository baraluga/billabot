import { useState } from 'react';
import { Search, User, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { formatHours, formatPercentage, getBillabilityStatus, truncateText } from '../lib/utils';

const UserCard = ({ user, userData }) => {
  const { userInfo, availability, billability } = userData;
  const billabilityStatus = getBillabilityStatus(billability.billablePercentage);
  const hasIssues = billability.totalLoggedHours > 0 && billability.billablePercentage < 25;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium">
              {userInfo.displayName || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-600">
              {userInfo.emailAddress || truncateText(userInfo.accountId, 20)}
            </p>
          </div>
        </div>
        
        {hasIssues && (
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Availability</span>
          </div>
          <p className="text-lg font-semibold">{formatHours(availability.totalPlannedHours)}</p>
          <p className="text-xs text-gray-600">{availability.planCount} plans</p>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Billability</span>
          </div>
          <p className="text-lg font-semibold">{formatPercentage(billability.billablePercentage)}</p>
          <p className="text-xs text-gray-600">
            {formatHours(billability.billableHours)} / {formatHours(billability.totalLoggedHours)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${billabilityStatus.bg} ${billabilityStatus.color}`}>
          {billabilityStatus.label}
        </span>
        <span className="text-xs text-gray-600">
          {billability.worklogCount} worklogs
        </span>
      </div>
    </div>
  );
};

const UserList = ({ userAnalysis }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('billablePercentage');

  if (!userAnalysis) return null;

  const users = Object.entries(userAnalysis);
  
  const filteredUsers = users.filter(([_, userData]) => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = userData.userInfo.displayName?.toLowerCase() || '';
    const email = userData.userInfo.emailAddress?.toLowerCase() || '';
    const accountId = userData.userInfo.accountId?.toLowerCase() || '';
    
    return displayName.includes(searchLower) || 
           email.includes(searchLower) || 
           accountId.includes(searchLower);
  });

  const sortedUsers = filteredUsers.sort((a, b) => {
    const [, aData] = a;
    const [, bData] = b;
    
    switch (sortBy) {
      case 'billablePercentage':
        return bData.billability.billablePercentage - aData.billability.billablePercentage;
      case 'totalLoggedHours':
        return bData.billability.totalLoggedHours - aData.billability.totalLoggedHours;
      case 'totalPlannedHours':
        return bData.availability.totalPlannedHours - aData.availability.totalPlannedHours;
      case 'displayName':
        return (aData.userInfo.displayName || '').localeCompare(bData.userInfo.displayName || '');
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold">Team Members ({users.length})</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 sm:w-64"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="billablePercentage">Billability %</option>
            <option value="totalLoggedHours">Logged Hours</option>
            <option value="totalPlannedHours">Planned Hours</option>
            <option value="displayName">Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedUsers.map(([userId, userData]) => (
          <UserCard key={userId} user={userId} userData={userData} />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found matching your search.
        </div>
      )}
    </div>
  );
};

export default UserList;