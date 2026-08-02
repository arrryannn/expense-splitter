import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  subtitle,
  isCurrency = true
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${colorClass}`}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{title}</span>

        <div
          className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 ${colorClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isCurrency
  ? typeof value === 'number'
    ? `₹${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : value
  : value}
        </h3>

        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;