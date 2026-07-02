'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import type { Course } from '@/utils/courses';
import type { CourseProgress } from '@/utils/progress';
import GlassPanel from '@/components/ui/GlassPanel';
import HologramText from '@/components/ui/HologramText';

interface CourseRoomProps {
  course: Course;
  progress: CourseProgress;
  onEnterVideo: () => void;
  onBack: () => void;
}

export default function CourseRoom({
  course,
  progress,
  onEnterVideo,
  onBack,
}: CourseRoomProps) {
  const isCompleted = progress.completed;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-deep-space/60 backdrop-blur-sm"
        onClick={onBack}
      />

      {/* Content Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-villa"
      >
        <GlassPanel heavy className="p-6 md:p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-body mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Villa
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `rgba(${course.colorRgb}, 0.15)`,
                border: `1px solid rgba(${course.colorRgb}, 0.25)`,
                boxShadow: `0 0 20px rgba(${course.colorRgb}, 0.1)`,
              }}
            >
              {course.icon}
            </div>

            <div className="flex-1 min-w-0">
              <HologramText as="h2" className="text-2xl md:text-3xl mb-1">
                {course.title}
              </HologramText>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                  style={{
                    background: `rgba(${course.colorRgb}, 0.15)`,
                    color: course.color,
                    border: `1px solid rgba(${course.colorRgb}, 0.2)`,
                  }}
                >
                  {course.difficulty}
                </span>
                <span className="text-white/30 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </span>
                <span className="text-white/30 text-xs">
                  {course.roomLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {progress.started && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/30 text-xs font-body">Progress</span>
                <span className="text-white/50 text-xs font-heading font-bold">
                  {Math.round(progress.watchProgress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.watchProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: isCompleted
                      ? 'linear-gradient(90deg, #F5C451, #D97706)'
                      : course.gradient,
                    boxShadow: isCompleted
                      ? '0 0 10px rgba(245, 196, 81, 0.5)'
                      : `0 0 10px rgba(${course.colorRgb}, 0.5)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-white/40 text-sm font-body leading-relaxed mb-6">
            {course.description}
          </p>

          {/* Topics */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-white/50 text-xs font-heading font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Course Modules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {course.topics.map((topic, i) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-2 text-white/30 text-xs font-body py-1.5"
                >
                  <div
                    className="w-1 h-1 rounded-full flex-shrink-0"
                    style={{ background: course.color }}
                  />
                  {topic}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-sm font-heading font-bold">
                <Award className="w-4 h-4" />
                Course Completed
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnterVideo}
                className="btn-premium px-6 py-3 text-white text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {progress.started ? 'Continue Learning' : 'Start Course'}
              </motion.button>
            )}

            {isCompleted && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnterVideo}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white text-sm font-heading transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Review
              </motion.button>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
