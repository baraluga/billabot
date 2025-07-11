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

  const templateQuestions = [
    "Who's available this week?",
    "How billable is our team?"
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
        <p className="mb-3 font-medium">Template Questions:</p>
        <div className="space-y-2">
          {templateQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setQuery(question)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm font-medium">{question}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueryInput;