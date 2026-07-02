'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, LogOut, GraduationCap, ArrowDown } from 'lucide-react';

import { getSession, logout as logoutUser, type VillaUser } from '@/utils/auth';
import { useProgress } from '@/hooks/useProgress';
import { type Course, getCourseById } from '@/utils/courses';

import LoadingScreen from '@/components/ui/LoadingScreen';
import VillaDoorLogin from '@/components/villa/VillaDoorLogin';
import CourseRoom from '@/components/courses/CourseRoom';
import CourseVideoRoom from '@/components/courses/CourseVideoRoom';
import CertificateRoom from '@/components/certificate/CertificateRoom';
import AIAssistant from '@/components/ui/AIAssistant';
import ProgressDashboard from '@/components/ui/ProgressDashboard';
import HologramText from '@/components/ui/HologramText';

// Dynamic import for the heavy 3D scene — prevents SSR issues
const FlyingVilla = dynamic(
  () => import('@/components/villa/FlyingVilla'),
  { ssr: false }
);

type AppPhase =
  | 'loading'
  | 'login'
  | 'entering'
  | 'exploring'
  | 'course-video';

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [user, setUser] = useState<VillaUser | null>(null);

  // 3D scene focus
  const [focusedTarget, setFocusedTarget] = useState<{
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Progress hook
  const {
    progress,
    startCourse,
    setWatchProgress,
    completeCourse,
    getCourseProgress,
    overallProgress,
  } = useProgress(user?.id);

  // Simulate loading progress
  useEffect(() => {
    if (phase !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 12 + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [phase]);

  // Handle loading complete — transition based on auth state
  const handleLoadingComplete = useCallback(() => {
    const existingUser = getSession();
    if (existingUser) {
      setUser(existingUser);
      setPhase('exploring');
    } else {
      setPhase('login');
    }
  }, []);

  // Handle login/register success
  const handleLoginSuccess = useCallback((authedUser: VillaUser) => {
    setUser(authedUser);
    setPhase('entering');
    // After door animation ends, switch to exploring
    setTimeout(() => {
      setPhase('exploring');
    }, 6500); // Total animation: 1s unlock + 2s open + 3s enter + 0.5s buffer
  }, []);

  // Select a course from the 3D scene
  const handleSelectCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
    setFocusedTarget({
      position: [
        course.position[0],
        course.position[1] + 0.8,
        course.position[2] + 4.2,
      ],
      lookAt: course.position,
    });
    document.body.style.overflow = 'hidden';
  }, []);

  // Exit course room back to exploring
  const handleExitRoom = useCallback(() => {
    setSelectedCourse(null);
    setFocusedTarget(null);
    document.body.style.overflow = 'auto';
  }, []);

  // Enter video room
  const handleEnterVideo = useCallback(() => {
    if (selectedCourse) {
      startCourse(selectedCourse.id);
      setPhase('course-video');
    }
  }, [selectedCourse, startCourse]);

  // Exit video room back to exploring
  const handleExitVideo = useCallback(() => {
    setPhase('exploring');
  }, []);

  // Progress updates from video player
  const handleProgressUpdate = useCallback(
    (pct: number, completed: boolean, certificateId?: string) => {
      if (!selectedCourse) return;
      setWatchProgress(selectedCourse.id, pct);
      if (completed && certificateId) {
        completeCourse(selectedCourse.id);
      }
    },
    [selectedCourse, setWatchProgress, completeCourse]
  );

  // Scroll tracking for exploration
  useEffect(() => {
    if (phase !== 'exploring' || focusedTarget) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(window.scrollY / totalHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [phase, focusedTarget]);

  // Logout
  const handleLogout = useCallback(() => {
    logoutUser();
    setUser(null);
    setPhase('login');
    setFocusedTarget(null);
    setSelectedCourse(null);
    document.body.style.overflow = 'auto';
  }, []);

  const completedCourseIds = Object.entries(progress.courses)
    .filter(([, cp]) => cp.completed)
    .map(([id]) => id);

  return (
    <main className="relative min-h-screen bg-deep-space overflow-x-hidden">
      {/* ======== 3D Villa Scene — always rendered after loading ======== */}
      {phase !== 'loading' && phase !== 'login' && (
        <FlyingVilla
          isExploring={phase === 'exploring'}
          focusedTarget={focusedTarget}
          onSelectCourse={handleSelectCourse}
          completedCourseIds={completedCourseIds}
        />
      )}

      {/* ======== 1. Loading Screen ======== */}
      <AnimatePresence>
        {phase === 'loading' && (
          <LoadingScreen
            progress={Math.min(loadingProgress, 100)}
            onComplete={handleLoadingComplete}
          />
        )}
      </AnimatePresence>

      {/* ======== 2. Login Door Portal ======== */}
      <AnimatePresence>
        {phase === 'login' && (
          <VillaDoorLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </AnimatePresence>

      {/* ======== 3. Entering Villa Cinematic ======== */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-5"
              >
                🏛️
              </motion.div>
              <HologramText as="h2" className="text-2xl md:text-3xl mb-3">
                Welcome, {user?.displayName}
              </HologramText>
              <p className="text-white/25 text-xs font-body tracking-[0.15em]">
                Entering the Flying AI Learning Villa...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== 4. Exploration Mode ======== */}
      {phase === 'exploring' && (
        <>
          {/* Scroll spacer for camera path */}
          {!focusedTarget && (
            <div className="absolute inset-x-0 top-0 h-[500vh] pointer-events-none z-0" />
          )}

          {/* ---- Top HUD Navigation ---- */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-ai-blue-light" />
              <span className="font-heading font-bold text-sm hologram-text hidden md:inline">
                Villa Academy
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Dashboard Button */}
              <button
                onClick={() => setShowProgressDashboard(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all backdrop-blur-md border border-white/5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard ({overallProgress}%)</span>
              </button>

              {/* User Badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/5 text-xs text-white/60">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-ai-blue to-cyber-purple flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.avatarInitials}
                </div>
                <span className="hidden md:inline">{user?.displayName}</span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 text-xs transition-all backdrop-blur-md border border-white/5 cursor-pointer"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.nav>

          {/* ---- Scroll Direction Hint ---- */}
          {!focusedTarget && scrollProgress < 0.9 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 text-center pointer-events-none select-none"
            >
              <span className="text-[10px] text-white/40 tracking-[0.2em] font-body uppercase">
                {scrollProgress < 0.2
                  ? 'Scroll to explore the villa'
                  : 'Scroll to discover more rooms'}
              </span>
              <ArrowDown className="w-4 h-4 text-white/40 animate-bounce" />
            </motion.div>
          )}

          {/* ---- Course Room Overlay ---- */}
          <AnimatePresence>
            {focusedTarget && selectedCourse && (
              <CourseRoom
                course={selectedCourse}
                progress={getCourseProgress(selectedCourse.id)}
                onEnterVideo={handleEnterVideo}
                onBack={handleExitRoom}
              />
            )}
          </AnimatePresence>

          {/* ---- Certificate Vault (scroll bottom) ---- */}
          <AnimatePresence>
            {!focusedTarget && scrollProgress > 0.9 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-x-0 bottom-0 z-30 pointer-events-auto"
              >
                <CertificateRoom
                  progress={progress}
                  userName={user?.displayName || 'Learner'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- AI Assistant ---- */}
          <AIAssistant
            progress={progress}
            userName={user?.displayName || 'Learner'}
            onNavigateToCourse={(cid) => {
              const course = getCourseById(cid);
              if (course) handleSelectCourse(course);
            }}
          />

          {/* ---- Progress Dashboard Modal ---- */}
          <AnimatePresence>
            {showProgressDashboard && (
              <ProgressDashboard
                progress={progress}
                isOpen={showProgressDashboard}
                onClose={() => setShowProgressDashboard(false)}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* ======== 5. Course Video Room ======== */}
      <AnimatePresence>
        {phase === 'course-video' && selectedCourse && user && (
          <CourseVideoRoom
            course={selectedCourse}
            progress={getCourseProgress(selectedCourse.id)}
            userId={user.id}
            userName={user.displayName}
            onBack={handleExitVideo}
            onProgressUpdated={handleProgressUpdate}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
