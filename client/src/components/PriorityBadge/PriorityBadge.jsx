import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const PriorityBadge = ({ priority, score, showIcon = true, size = 'sm' }) => {
  if (!priority) return null;

  const normalized = priority.toUpperCase();

  const configs = {
    HIGH: {
      bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: AlertCircle,
      label: 'High Priority',
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      label: 'Medium Priority',
    },
    LOW: {
      bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: Info,
      label: 'Low Priority',
    },
  };

  const current = configs[normalized] || configs.LOW;
  const Icon = current.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${sizeClasses[size] || sizeClasses.sm}`}
      title={score ? `Priority Score: ${score}/100` : current.label}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{normalized}</span>
      {score ? <span className="opacity-75 font-mono text-[10px]">({score})</span> : null}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  if (!category) return null;

  const colorMap = {
    Work: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Personal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Education: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    Finance: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    Shopping: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    Social: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    Promotions: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    Important: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  const style = colorMap[category] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';

  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md font-medium border ${style}`}>
      {category}
    </span>
  );
};
