'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, ChevronRight, BookOpen, Award, TrendingUp } from 'lucide-react';
import type { UserProgress } from '@/utils/progress';
import { COURSES } from '@/utils/courses';
import GlassPanel from './GlassPanel';

interface AIAssistantProps {
  progress: UserProgress;
  userName: string;
  onNavigateToCourse: (courseId: string) => void;
}

export default function AIAssistant({
  progress,
  userName,
  onNavigateToCourse,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  const completedIds = useMemo(
    () =>
      Object.entries(progress.courses)
        .filter(([, cp]) => cp.completed)
        .map(([id]) => id),
    [progress]
  );

  const inProgressIds = useMemo(
    () =>
      Object.entries(progress.courses)
        .filter(([, cp]) => cp.started && !cp.completed)
        .map(([id]) => id),
    [progress]
  );

  const recommendations = useMemo(() => {
    // Recommend courses not yet started
    const notStarted = COURSES.filter(
      (c) => !completedIds.includes(c.id) && !inProgressIds.includes(c.id)
    );
    return notStarted.slice(0, 3);
  }, [completedIds, inProgressIds]);

  const greeting = useMemo(() => {
    if (completedIds.length === 0 && inProgressIds.length === 0) {
      return `Welcome, ${userName}! I recommend starting with Python Development — it's perfect for beginners.`;
    }
    if (inProgressIds.length > 0) {
      const course = COURSES.find((c) => c.id === inProgressIds[0]);
      return `You're making progress on ${course?.shortTitle}! Keep going, you're doing great.`;
    }
    if (completedIds.length === COURSES.length) {
      return `Incredible, ${userName}! You've completed all courses. You're a true Villa Scholar! 🏆`;
    }
    return `Great progress, ${userName}! You've completed ${completedIds.length} course${completedIds.length > 1 ? 's' : ''}. Ready for the next challenge?`;
  }, [userName, completedIds, inProgressIds]);

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open AI Assistant"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            boxShadow:
              '0 4px 20px rgba(37, 99, 235, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)',
          }}
        >
          <Bot className="w-6 h-6 text-white" />

          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full animate-pulse-ring border border-ai-blue/30" />
        </div>

        {/* Tooltip */}
        <div className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-white/60 whitespace-nowrap border border-white/5">
            AI Learning Guide
          </div>
        </div>
      </motion.button>

      {/* AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-80 md:w-96"
          >
            <GlassPanel heavy className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-heading font-semibold">
                      Villa AI Guide
                    </p>
                    <p className="text-white/20 text-[9px] font-body">
                      Your learning companion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto scrollbar-villa">
                {/* Greeting */}
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-xs font-body leading-relaxed">
                    {greeting}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                    <BookOpen className="w-4 h-4 text-ai-blue mx-auto mb-1" />
                    <p className="text-white/60 text-sm font-heading font-bold">
                      {inProgressIds.length}
                    </p>
                    <p className="text-white/20 text-[8px] uppercase tracking-wider">
                      In Progress
                    </p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                    <Award className="w-4 h-4 text-luxury-gold mx-auto mb-1" />
                    <p className="text-white/60 text-sm font-heading font-bold">
                      {completedIds.length}
                    </p>
                    <p className="text-white/20 text-[8px] uppercase tracking-wider">
                      Completed
                    </p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                    <TrendingUp className="w-4 h-4 text-cyber-purple mx-auto mb-1" />
                    <p className="text-white/60 text-sm font-heading font-bold">
                      {COURSES.length - completedIds.length - inProgressIds.length}
                    </p>
                    <p className="text-white/20 text-[8px] uppercase tracking-wider">
                      Remaining
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider font-heading font-bold mb-2">
                      Recommended Next
                    </p>
                    <div className="space-y-1.5">
                      {recommendations.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToCourse(course.id);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all text-left group"
                        >
                          <span className="text-lg">{course.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/50 text-xs font-heading font-semibold truncate">
                              {course.shortTitle}
                            </p>
                            <p className="text-white/20 text-[9px] font-body">
                              {course.difficulty} · {course.duration}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue In-Progress */}
                {inProgressIds.length > 0 && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider font-heading font-bold mb-2">
                      Continue Where You Left Off
                    </p>
                    {inProgressIds.map((id) => {
                      const course = COURSES.find((c) => c.id === id);
                      const cp = progress.courses[id];
                      if (!course || !cp) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToCourse(id);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all text-left group"
                        >
                          <span className="text-lg">{course.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/50 text-xs font-heading font-semibold truncate">
                              {course.shortTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-0.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${cp.watchProgress}%`,
                                    background: course.gradient,
                                  }}
                                />
                              </div>
                              <span className="text-white/30 text-[9px]">
                                {Math.round(cp.watchProgress)}%
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
