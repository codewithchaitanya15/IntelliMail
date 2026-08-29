import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { aiService } from '../../services/ai.js';

export const DeadlinesWidget = ({ email }) => {
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email) {
      if (email.dates && email.dates.length > 0) {
        setDates(email.dates);
      } else {
        handleExtract();
      }
    }
  }, [email]);

  const handleExtract = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.extractDates({ email });
      setDates(data.dates || []);
    } catch (err) {
      console.warn('Extract dates failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Dates & Deadlines ({dates.length})</span>
        </div>
        <button
          onClick={handleExtract}
          disabled={isLoading}
          className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" /> Detect
        </button>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-400">Detecting timeline events...</div>
      ) : dates.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">No timeline dates or deadlines detected.</p>
      ) : (
        <div className="space-y-2">
          {dates.map((d, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{d.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-medium text-amber-700 dark:text-amber-400">{d.date}</span>
                  {d.time && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {d.time}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {d.type || 'Event'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
