'use client';

import { Suspense, lazy, type ComponentType } from 'react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartWrapper({
  title,
  subtitle,
  children,
  className = '',
}: ChartWrapperProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-heading font-bold text-white/60">{title}</h3>
        {subtitle && (
          <p className="text-white/20 text-[10px] font-body mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Chart Content */}
      <div className="px-3 pb-4">
        <Suspense
          fallback={
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-ai-blue/30 border-t-ai-blue rounded-full animate-spin" />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}

// ---- Recharts color theme matching the villa ----
export const CHART_COLORS = {
  blue: '#3B82F6',
  purple: '#8B5CF6',
  gold: '#F5C451',
  cyan: '#06B6D4',
  emerald: '#10B981',
  rose: '#EC4899',
  red: '#EF4444',
  indigo: '#6366F1',
  grid: 'rgba(255, 255, 255, 0.04)',
  axis: 'rgba(255, 255, 255, 0.15)',
  tooltip: 'rgba(10, 17, 40, 0.95)',
};

export const CHART_GRADIENT_DEFS = (
  <defs>
    <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id="chartGradientPurple" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id="chartGradientGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F5C451" stopOpacity={0.4} />
      <stop offset="100%" stopColor="#F5C451" stopOpacity={0.02} />
    </linearGradient>
  </defs>
);
