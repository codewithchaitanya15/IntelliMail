import React from 'react';

export const EmailCardSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 animate-pulse">
    <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800"></div>
    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
    <div className="w-36 h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
    <div className="flex-1 space-y-2">
      <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
    </div>
    <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-800"></div>
  </div>
);

export const EmailViewerSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-2/3 h-7 rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-slate-800"></div>
    </div>
    <div className="flex items-center gap-4 py-4 border-y border-slate-200 dark:border-slate-800">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800"></div>
      <div className="space-y-2 flex-1">
        <div className="w-48 h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="w-32 h-3 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </div>
    <div className="space-y-3 pt-4">
      <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="w-5/6 h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
      <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800"></div>
    </div>
  </div>
);

export const AISummarySkeleton = () => (
  <div className="p-5 rounded-xl border border-ai-200 dark:border-ai-900/50 bg-ai-50/50 dark:bg-ai-950/20 animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-32 h-5 rounded bg-ai-200 dark:bg-ai-900"></div>
      <div className="w-16 h-4 rounded bg-ai-200 dark:bg-ai-900"></div>
    </div>
    <div className="w-full h-4 rounded bg-ai-200 dark:bg-ai-900"></div>
    <div className="w-4/5 h-4 rounded bg-ai-200 dark:bg-ai-900"></div>
    <div className="space-y-2 pt-2">
      <div className="w-3/4 h-3 rounded bg-ai-200 dark:bg-ai-900"></div>
      <div className="w-2/3 h-3 rounded bg-ai-200 dark:bg-ai-900"></div>
    </div>
  </div>
);
