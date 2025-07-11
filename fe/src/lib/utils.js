// Date utilities
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateISO = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return {
    from: formatDateISO(start),
    to: formatDateISO(end),
    fromDate: start,
    toDate: end
  };
};

// Number utilities
export const formatHours = (hours) => {
  if (hours === 0) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
};

export const formatPercentage = (percentage) => {
  return `${Math.round(percentage)}%`;
};

// Status utilities
export const getBillabilityStatus = (percentage) => {
  if (percentage >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
  if (percentage >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (percentage >= 40) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  if (percentage >= 20) return { label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
  return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
};

export const getCapacityStatus = (hours) => {
  if (hours >= 35) return { label: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  if (hours >= 25) return { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  if (hours >= 15) return { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
  return { label: 'Minimal', color: 'text-gray-600', bg: 'bg-gray-100' };
};

// Text utilities
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Chart utilities
export const generateChartColors = (count) => {
  const colors = [
    '#007acd', '#0062a4', '#004a7b', '#003152', '#001929',
    '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'
  ];
  return colors.slice(0, count);
};

// Loading utilities
export const createLoadingState = (isLoading, error = null) => ({
  isLoading,
  error,
  hasError: !!error,
});

// Error handling
export const getErrorMessage = (error) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};