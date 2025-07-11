import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const QueryInput = ({ onSubmit, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const placeholderQueries = [
    "How is our team doing this week?",
    "Who has the highest billability?",
    "What's our capacity utilization?",
    "Show me users who need attention",
    "Analyze our team for the last 30 days"
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Ask about your team</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything about your team..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Ask
          </button>
        </div>
      </form>

      <div className="text-sm text-gray-600">
        <p className="mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {placeholderQueries.map((placeholder, index) => (
            <button
              key={index}
              onClick={() => setQuery(placeholder)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
              disabled={isLoading}
            >
              {placeholder}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueryInput;