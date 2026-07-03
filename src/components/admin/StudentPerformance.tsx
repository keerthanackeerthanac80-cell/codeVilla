'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import ChartWrapper, { CHART_COLORS } from '@/components/ui/ChartWrapper';
import { getAllStudentPerformances } from '@/lib/analytics-service';
import type { StudentPerformanceScore } from '@/lib/firestore-types';

const LEVEL_COLORS: Record<StudentPerformanceScore['level'], string> = {
  Excellent: '#10B981',
  'Very Good': '#3B82F6',
  Good: '#8B5CF6',
  'Needs Improvement': '#F59E0B',
  'At Risk': '#EF4444',
};

const LEVEL_EMOJIS: Record<StudentPerformanceScore['level'], string> = {
  Excellent: '🌟',
  'Very Good': '⭐',
  Good: '👍',
  'Needs Improvement': '📈',
  'At Risk': '⚠️',
};

export default function StudentPerformance() {
  const [performances, setPerformances] = useState<StudentPerformanceScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformanceScore | null>(null);

  useEffect(() => {
    getAllStudentPerformances()
      .then((data) => {
        setPerformances(data.sort((a, b) => b.overallScore - a.overallScore));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Level distribution
  const levelDistribution = ['Excellent', 'Very Good', 'Good', 'Needs Improvement', 'At Risk'].map(
    (level) => ({
      level,
      count: performances.filter((p) => p.level === level).length,
      color: LEVEL_COLORS[level as StudentPerformanceScore['level']],
    })
  );

  // Radar data for selected student
  const radarData = selectedStudent
    ? [
        { subject: 'Attendance', score: selectedStudent.attendanceScore },
        { subject: 'Watch Time', score: selectedStudent.watchTimeScore },
        { subject: 'Completion', score: selectedStudent.completionScore },
        { subject: 'Consistency', score: selectedStudent.consistencyScore },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {levelDistribution.map((item) => (
          <div
            key={item.level}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
          >
            <p className="text-xl mb-1">
              {LEVEL_EMOJIS[item.level as StudentPerformanceScore['level']]}
            </p>
            <p
              className="text-2xl font-heading font-bold"
              style={{ color: item.color }}
            >
              {item.count}
            </p>
            <p className="text-white/25 text-[9px] uppercase tracking-wider mt-0.5">
              {item.level}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution Chart */}
        <ChartWrapper title="Score Distribution" subtitle="Overall performance scores">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="level"
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
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
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {levelDistribution.map((entry, i) => (
                  <motion.rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Student Radar Chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-heading font-bold text-white/60 mb-1">
            Student Detail
          </h3>
          <p className="text-white/20 text-[10px] font-body mb-3">
            {selectedStudent
              ? `Performance breakdown for ${selectedStudent.userName}`
              : 'Select a student below to view their performance breakdown'}
          </p>
          {selectedStudent ? (
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                />
                <PolarRadiusAxis
                  tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 8 }}
                  domain={[0, 100]}
                />
                <Radar
                  dataKey="score"
                  stroke={LEVEL_COLORS[selectedStudent.level]}
                  fill={LEVEL_COLORS[selectedStudent.level]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] flex items-center justify-center text-white/10 text-xs">
              Click on a student to see their radar chart
            </div>
          )}
        </div>
      </div>

      {/* Student List */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-heading font-bold text-white/60">All Students</h3>
          <p className="text-white/20 text-[10px] font-body">Ranked by overall score</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto scrollbar-villa">
          {performances.map((student, i) => (
            <motion.button
              key={student.userId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedStudent(student)}
              className={`w-full flex items-center gap-3 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-all text-left ${
                selectedStudent?.userId === student.userId ? 'bg-white/[0.04]' : ''
              }`}
            >
              {/* Rank */}
              <span className="text-white/15 text-xs font-heading font-bold w-6 tabular-nums">
                #{i + 1}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-xs font-heading font-semibold truncate">
                  {student.userName}
                </p>
              </div>

              {/* Score Bars */}
              <div className="flex items-center gap-1 w-40 flex-shrink-0">
                {[
                  { label: 'A', value: student.attendanceScore, color: '#3B82F6' },
                  { label: 'W', value: student.watchTimeScore, color: '#8B5CF6' },
                  { label: 'C', value: student.completionScore, color: '#10B981' },
                  { label: 'S', value: student.consistencyScore, color: '#F5C451' },
                ].map((bar) => (
                  <div key={bar.label} className="flex-1" title={`${bar.label}: ${bar.value}%`}>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${bar.value}%`, background: bar.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Score */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-sm font-heading font-bold tabular-nums"
                  style={{ color: LEVEL_COLORS[student.level] }}
                >
                  {student.overallScore}
                </span>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-md font-heading font-bold"
                  style={{
                    background: `${LEVEL_COLORS[student.level]}15`,
                    color: LEVEL_COLORS[student.level],
                  }}
                >
                  {student.level}
                </span>
              </div>
            </motion.button>
          ))}
          {performances.length === 0 && (
            <div className="px-5 py-12 text-center text-white/15 text-xs">
              No student performance data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
