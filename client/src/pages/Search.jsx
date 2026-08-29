import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, Filter, Inbox, ArrowRight } from 'lucide-react';
import { EmailCard } from '../components/EmailCard/EmailCard.jsx';
import { EmailCardSkeleton } from '../components/LoadingSkeleton/LoadingSkeleton.jsx';
import { useEmailStore } from '../store/emailStore.js';
import { useUIStore } from '../store/uiStore.js';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(initialQuery);

  const { emails, isLoading, fetchEmails, searchQuery, setSearchQuery } = useEmailStore();
  const { setActiveAIModal } = useUIStore();

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      fetchEmails('', initialQuery);
    } else {
      fetchEmails('', '');
    }
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: localQuery });
    setSearchQuery(localQuery);
    fetchEmails('', localQuery);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
      {/* Search Header & Inputs */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-brand-500" />
            <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-display">
              Email Search
            </h1>
          </div>

          <button
            onClick={() => setActiveAIModal('smartSearch')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-ai-500/10 to-brand-500/10 text-ai-600 dark:text-ai-400 hover:from-ai-500/20 hover:to-brand-500/20 border border-ai-500/20 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Natural Language Search</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Filter by sender (from:), subject, has:attachment, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {initialQuery && (
          <div className="text-xs text-slate-500">
            Showing results for <span className="font-bold text-slate-800 dark:text-slate-200">"{initialQuery}"</span>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <EmailCardSkeleton key={i} />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500">
            <Inbox className="w-14 h-14 mb-3 opacity-30 stroke-1" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No matching emails found
            </p>
            <p className="text-xs mt-1">Try adjusting your query or use AI Smart Search above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {emails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
