import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ListTodo, Sparkles, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../services/ai.js';
import toast from 'react-hot-toast';

export const ActionItemsWidget = ({ email }) => {
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email) {
      if (email.actionItems && email.actionItems.length > 0) {
        // If string array
        if (typeof email.actionItems[0] === 'string') {
          setItems(email.actionItems.map((task) => ({ task, assignee: 'You', urgency: 'MEDIUM' })));
        } else {
          setItems(email.actionItems);
        }
      } else {
        handleExtract();
      }
    }
  }, [email]);

  const handleExtract = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.extractActionItems({ email });
      setItems(data.actionItems || []);
    } catch (err) {
      console.warn('Extract action items failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (index) => {
    setCompleted((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!email) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
          <ListTodo className="w-4 h-4 text-brand-500" />
          <span>Extracted Action Items ({items.length})</span>
        </div>
        <button
          onClick={handleExtract}
          disabled={isLoading}
          className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-400">Extracting tasks with AI...</div>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">No specific action items identified in this email.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const isDone = !!completed[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-xs ${
                  isDone
                    ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 line-through text-slate-400'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-brand-50/30'
                }`}
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.task}</p>
                  {item.due && item.due !== 'None specified' && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                      Due: {item.due}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
