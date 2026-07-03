'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper, { CHART_COLORS, CHART_GRADIENT_DEFS } from '@/components/ui/ChartWrapper';
import { getLearningHoursChart, getActivityHeatmap } from '@/lib/analytics-service';
import type { LearningTimeData, HeatmapCell } from '@/lib/firestore-types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function VideoAnalytics() {
  const [dailyHours, setDailyHours] = useState<LearningTimeData[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<LearningTimeData[]>([]);
  const [monthlyHours, setMonthlyHours] = useState<LearningTimeData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, w, m, h] = await Promise.all([
          getLearningHoursChart('daily', 14),
          getLearningHoursChart('weekly'),
          getLearningHoursChart('monthly'),
          getActivityHeatmap(),
        ]);
        setDailyHours(d);
        setWeeklyHours(w);
        setMonthlyHours(m);
        setHeatmap(h);
      } catch (err) {
        console.error('Failed to fetch video analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getActiveData = () => {
    switch (activePeriod) {
      case 'daily':
        return dailyHours;
      case 'weekly':
        return weeklyHours;
      case 'monthly':
        return monthlyHours;
    }
  };

  // Heatmap max value for color intensity
  const maxHeatmapValue = Math.max(...heatmap.map((c) => c.value), 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Hours Chart */}
      <ChartWrapper
        title="Learning Hours"
        subtitle={`${activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} breakdown`}
      >
        {/* Period Tabs */}
        <div className="flex items-center gap-1 px-2 mb-3">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-semibold transition-all ${
                activePeriod === period
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/25 hover:text-white/50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={getActiveData()}>
            {CHART_GRADIENT_DEFS}
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="label"
              stroke={CHART_COLORS.axis}
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke={CHART_COLORS.axis}
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: CHART_COLORS.tooltip,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '11px',
              }}
              formatter={(value: any) => [`${value}h`, 'Learning Hours']}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke={CHART_COLORS.purple}
              strokeWidth={2}
              fill="url(#chartGradientPurple)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Heatmap */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="text-sm font-heading font-bold text-white/60 mb-1">
          Student Activity Heatmap
        </h3>
        <p className="text-white/20 text-[10px] font-body mb-4">
          Activity intensity by day and hour (minutes)
        </p>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1 ml-10">
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[8px] text-white/15 font-body"
                >
                  {h % 3 === 0 ? `${h}:00` : ''}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1 mb-0.5">
                <span className="w-8 text-[9px] text-white/25 font-body text-right">
                  {day}
                </span>
                <div className="flex-1 flex gap-0.5">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = heatmap.find(
                      (c) => c.day === dayIndex && c.hour === hour
                    );
                    const value = cell?.value || 0;
                    const intensity = maxHeatmapValue > 0 ? value / maxHeatmapValue : 0;

                    return (
                      <div
                        key={hour}
                        className="flex-1 aspect-square rounded-[2px] transition-all hover:scale-150 hover:z-10"
                        style={{
                          background:
                            intensity > 0
                              ? `rgba(59, 130, 246, ${0.1 + intensity * 0.8})`
                              : 'rgba(255, 255, 255, 0.02)',
                        }}
                        title={`${day} ${hour}:00 — ${value} min`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-[8px] text-white/20">Less</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                <div
                  key={opacity}
                  className="w-3 h-3 rounded-[2px]"
                  style={{ background: `rgba(59, 130, 246, ${opacity})` }}
                />
              ))}
              <span className="text-[8px] text-white/20">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
