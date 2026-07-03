'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  Flame,
  Calendar,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { UserProgress } from '@/utils/progress';
import { COURSES } from '@/utils/courses';
import { calculateOverallProgress } from '@/utils/progress';
import GlassPanel from '@/components/ui/GlassPanel';
import HologramText from '@/components/ui/HologramText';
import ChartWrapper, { CHART_COLORS, CHART_GRADIENT_DEFS } from '@/components/ui/ChartWrapper';
import { useStudentAnalytics } from '@/hooks/useStudentAnalytics';

interface StudentDashboardProps {
  progress: UserProgress;
  userId: string;
  userName: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDashboard({
  progress,
  userId,
  userName,
  userEmail,
  isOpen,
  onClose,
}: StudentDashboardProps) {
  const overallPct = calculateOverallProgress(progress, COURSES.length);
  const { analytics, isLoading } = useStudentAnalytics(userId);

  const stats = useMemo(() => {
    const courses = Object.values(progress.courses);
    return {
      completed: courses.filter((c) => c.completed).length,
      inProgress: courses.filter((c) => c.started && !c.completed).length,
      notStarted: COURSES.length - courses.filter((c) => c.started).length,
      certificates: courses.filter((c) => c.certificateId).length,
    };
  }, [progress]);

  // SVG Progress Ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-villa"
      >
        <GlassPanel heavy className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ai-blue to-cyber-purple flex items-center justify-center text-xl font-bold text-white">
                {userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <HologramText as="h2" className="text-xl md:text-2xl mb-0.5">
                  {userName}
                </HologramText>
                {userEmail && (
                  <p className="text-white/20 text-xs font-body">{userEmail}</p>
                )}
                {analytics && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-ai-blue/10 text-ai-blue border border-ai-blue/20 font-heading font-bold">
                      {analytics.learningLevel}
                    </span>
                    {analytics.currentStreak > 0 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 font-heading font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {analytics.currentStreak} day streak
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1.5" />
              <p className="text-xl font-heading font-bold text-white/80">{stats.completed}</p>
              <p className="text-white/20 text-[9px] uppercase tracking-wider">Completed</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <BookOpen className="w-4 h-4 text-ai-blue mb-1.5" />
              <p className="text-xl font-heading font-bold text-white/80">{stats.inProgress}</p>
              <p className="text-white/20 text-[9px] uppercase tracking-wider">In Progress</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <Award className="w-4 h-4 text-luxury-gold mb-1.5" />
              <p className="text-xl font-heading font-bold text-white/80">{stats.certificates}</p>
              <p className="text-white/20 text-[9px] uppercase tracking-wider">Certificates</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <Clock className="w-4 h-4 text-cyber-purple mb-1.5" />
              <p className="text-xl font-heading font-bold text-white/80">
                {analytics?.totalHoursStudied || 0}h
              </p>
              <p className="text-white/20 text-[9px] uppercase tracking-wider">Hours Studied</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <Flame className="w-4 h-4 text-orange-400 mb-1.5" />
              <p className="text-xl font-heading font-bold text-white/80">
                {analytics?.currentStreak || 0}
              </p>
              <p className="text-white/20 text-[9px] uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <TrendingUp className="w-4 h-4 text-indigo-400 mb-1.5" />
              <p className="text-xl font-heading font-bold text-white/80">
                {analytics?.dailyLearningMinutes || 0}m
              </p>
              <p className="text-white/20 text-[9px] uppercase tracking-wider">Today</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column — Progress Ring + Learning Time */}
            <div className="space-y-4">
              {/* Progress Ring */}
              <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5 text-center">
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle className="progress-ring-track" cx="60" cy="60" r={radius} strokeWidth="6" />
                    <circle
                      className="progress-ring-fill"
                      cx="60" cy="60" r={radius} strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      stroke="url(#progressGradientStudent)"
                    />
                    <defs>
                      <linearGradient id="progressGradientStudent" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="50%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#F5C451" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-heading font-bold text-white">{overallPct}%</span>
                    <span className="text-white/20 text-[8px] uppercase tracking-wider">Overall</span>
                  </div>
                </div>
                <p className="text-white/30 text-[10px]">
                  {stats.completed} of {COURSES.length} courses completed
                </p>
              </div>

              {/* Learning Time Breakdown */}
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 space-y-2.5">
                <h4 className="text-white/40 text-[10px] uppercase tracking-wider font-heading font-bold">
                  Learning Time
                </h4>
                {[
                  { label: 'Today', value: `${analytics?.dailyLearningMinutes || 0} min` },
                  { label: 'This Week', value: `${analytics?.weeklyLearningHours || 0}h` },
                  { label: 'This Month', value: `${analytics?.monthlyLearningHours || 0}h` },
                  { label: 'All Time', value: `${analytics?.totalHoursStudied || 0}h` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-white/25">{item.label}</span>
                    <span className="text-white/60 font-heading font-bold tabular-nums">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column — Course Progress + Weekly Chart */}
            <div className="lg:col-span-2 space-y-4">
              {/* Weekly Learning Chart */}
              {analytics && analytics.weeklyData.length > 0 && (
                <ChartWrapper title="This Week's Learning" subtitle="Hours studied per day">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={analytics.weeklyData}>
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
                        formatter={(value: any) => [`${value}h`, 'Hours']}
                      />
                      <Bar dataKey="hours" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              )}

              {/* Learning Calendar */}
              {analytics && analytics.learningCalendar.length > 0 && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <h4 className="text-white/40 text-[10px] uppercase tracking-wider font-heading font-bold">
                      Learning Calendar (Last 30 Days)
                    </h4>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {analytics.learningCalendar.map((day) => {
                      const maxMin = Math.max(
                        ...analytics.learningCalendar.map((d) => d.minutes),
                        1
                      );
                      const intensity = day.minutes / maxMin;
                      return (
                        <div
                          key={day.date}
                          className="aspect-square rounded-[3px] transition-all hover:scale-125"
                          style={{
                            background:
                              day.minutes > 0
                                ? `rgba(59, 130, 246, ${0.15 + intensity * 0.75})`
                                : 'rgba(255, 255, 255, 0.02)',
                          }}
                          title={`${day.date}: ${day.minutes} min`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Course Progress */}
              <div>
                <h3 className="text-white/40 text-xs font-heading font-bold uppercase tracking-wider mb-3">
                  Course Progress
                </h3>
                <div className="space-y-2.5">
                  {COURSES.map((course, i) => {
                    const cp = progress.courses[course.id];
                    const pct = cp?.watchProgress || 0;
                    const isCompleted = cp?.completed || false;

                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{
                            background: `rgba(${course.colorRgb}, 0.1)`,
                            border: `1px solid rgba(${course.colorRgb}, 0.15)`,
                          }}
                        >
                          {course.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/50 text-[11px] font-heading font-semibold truncate">
                              {course.shortTitle}
                            </span>
                            <span className="text-white/25 text-[10px] font-heading tabular-nums ml-2">
                              {Math.round(pct)}%
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.04 }}
                              className="h-full rounded-full"
                              style={{
                                background: isCompleted
                                  ? 'linear-gradient(90deg, #F5C451, #D97706)'
                                  : course.gradient,
                              }}
                            />
                          </div>
                        </div>
                        {isCompleted && (
                          <Award className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
