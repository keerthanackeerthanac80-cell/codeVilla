'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import HologramText from './HologramText';

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

// Floating particle component
function Particle({ index }: { index: number }) {
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 1}px`,
    height: `${Math.random() * 4 + 1}px`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${Math.random() * 4 + 4}s`,
    opacity: Math.random() * 0.5 + 0.1,
  }), []);

  return (
    <div
      className="particle-dot animate-float"
      style={style}
    />
  );
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const hasCompleted = useRef(false);

  // Smooth counter animation
  useEffect(() => {
    const target = Math.min(Math.round(progress), 100);
    if (displayProgress < target) {
      const timer = setTimeout(() => {
        setDisplayProgress((prev) => Math.min(prev + 1, target));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  // Trigger complete
  useEffect(() => {
    if (displayProgress >= 100 && !hasCompleted.current) {
      hasCompleted.current = true;
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, onComplete]);

  const particles = useMemo(
    () => Array.from({ length: 40 }, (_, i) => <Particle key={i} index={i} />),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep-space"
      role="progressbar"
      aria-valuenow={displayProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading Flying AI Learning Villa"
    >
      {/* Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles}
      </div>

      {/* Outer glow ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, rgba(37,99,235,${displayProgress / 300}) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 text-center mb-12"
      >
        {/* Villa Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-7xl mb-6"
        >
          🏛️
        </motion.div>

        <HologramText as="h1" className="text-4xl md:text-5xl lg:text-6xl mb-3 tracking-tight">
          Flying AI Learning Villa
        </HologramText>

        <p className="text-white/30 text-sm md:text-base font-body tracking-[0.3em] uppercase">
          Premium AI Education Academy
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: '100%' }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 max-w-md w-full px-8"
      >
        {/* Track */}
        <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${displayProgress}%`,
              background: 'linear-gradient(90deg, #2563EB, #7C3AED, #2563EB)',
              backgroundSize: '200% 100%',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.6), 0 0 40px rgba(124, 58, 237, 0.3)',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          {/* Shimmer */}
          <div className="absolute inset-0 shimmer-bg" />
        </div>

        {/* Percentage */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-white/20 text-xs font-body tracking-wider">
            {displayProgress < 30 && 'Initializing villa systems...'}
            {displayProgress >= 30 && displayProgress < 60 && 'Loading learning environments...'}
            {displayProgress >= 60 && displayProgress < 90 && 'Preparing course rooms...'}
            {displayProgress >= 90 && 'Villa ready for entry...'}
          </span>
          <span className="text-white/40 text-xs font-heading font-bold tabular-nums">
            {displayProgress}%
          </span>
        </div>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-white/15 text-[10px] font-body tracking-[0.5em] uppercase">
          {displayProgress >= 100 ? '✦ Entering Villa ✦' : '✦ Luxury Learning Experience ✦'}
        </p>
      </motion.div>
    </motion.div>
  );
}
