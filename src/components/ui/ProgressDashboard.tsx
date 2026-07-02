'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Award, BookOpen, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { UserProgress } from '@/utils/progress';
import { COURSES } from '@/utils/courses';
import { calculateOverallProgress } from '@/utils/progress';
import GlassPanel from './GlassPanel';
import HologramText from './HologramText';

interface ProgressDashboardProps {
  progress: UserProgress;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProgressDashboard({
  progress,
  isOpen,
  onClose,
}: ProgressDashboardProps) {
  const overallPct = calculateOverallProgress(progress, COURSES.length);

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
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-villa"
      >
        <GlassPanel heavy className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <HologramText as="h2" className="text-2xl mb-1">
                Learning Dashboard
              </HologramText>
              <p className="text-white/25 text-xs font-body">
                Your progress across all courses
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Progress Ring + Stats */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Ring */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  className="progress-ring-track"
                  cx="60"
                  cy="60"
                  r={radius}
                  strokeWidth="6"
                />
                <circle
                  className="progress-ring-fill"
                  cx="60"
                  cy="60"
                  r={radius}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  stroke="url(#progressGradient)"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#F5C451" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-bold text-white">{overallPct}%</span>
                <span className="text-white/20 text-[9px] uppercase tracking-wider">Complete</span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-2xl font-heading font-bold text-white/80">{stats.completed}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-wider">Completed</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <BookOpen className="w-5 h-5 text-ai-blue mb-2" />
                <p className="text-2xl font-heading font-bold text-white/80">{stats.inProgress}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-wider">In Progress</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <Award className="w-5 h-5 text-luxury-gold mb-2" />
                <p className="text-2xl font-heading font-bold text-white/80">{stats.certificates}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-wider">Certificates</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                <TrendingUp className="w-5 h-5 text-cyber-purple mb-2" />
                <p className="text-2xl font-heading font-bold text-white/80">{stats.notStarted}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-wider">Not Started</p>
              </div>
            </div>
          </div>

          {/* Per-Course Progress */}
          <div>
            <h3 className="text-white/40 text-xs font-heading font-bold uppercase tracking-wider mb-4">
              Course Progress
            </h3>
            <div className="space-y-3">
              {COURSES.map((course, i) => {
                const cp = progress.courses[course.id];
                const pct = cp?.watchProgress || 0;
                const isCompleted = cp?.completed || false;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: `rgba(${course.colorRgb}, 0.1)`,
                        border: `1px solid rgba(${course.colorRgb}, 0.15)`,
                      }}
                    >
                      {course.icon}
                    </div>

                    {/* Info + Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/50 text-xs font-heading font-semibold truncate">
                          {course.shortTitle}
                        </span>
                        <span className="text-white/30 text-[10px] font-heading tabular-nums ml-2 flex-shrink-0">
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full rounded-full"
                          style={{
                            background: isCompleted
                              ? 'linear-gradient(90deg, #F5C451, #D97706)'
                              : course.gradient,
                          }}
                        />
                      </div>
                    </div>

                    {/* Completion badge */}
                    {isCompleted && (
                      <Award className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
