'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import HeroFrameSequence from '@/components/villa/HeroFrameSequence';
import HologramText from '@/components/ui/HologramText';
import { loginUser, registerUser, type VillaUser } from '@/utils/auth';

interface VillaDoorLoginProps {
  onLoginSuccess: (user: VillaUser) => void;
}

export default function VillaDoorLogin({ onLoginSuccess }: VillaDoorLoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Door animation state
  const [doorPhase, setDoorPhase] = useState<'idle' | 'unlocking' | 'opening' | 'entering'>('idle');
  const [frameProgress, setFrameProgress] = useState(0);
  const animationRef = useRef<number>(0);

  // Animate door opening sequence
  const animateDoorOpen = useCallback(
    (user: VillaUser) => {
      setDoorPhase('unlocking');

      // Phase 1: Lock mechanism (0-1s) — stay at frame 0
      setTimeout(() => {
        setDoorPhase('opening');

        // Phase 2: Door opens (1-3s) — animate frames 0 to 120
        const startTime = performance.now();
        const duration = 2000;

        const animateOpening = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const openProgress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - openProgress, 3);
          setFrameProgress(eased * 0.5); // 0 to 0.5 maps to frames 0–120

          if (openProgress < 1) {
            animationRef.current = requestAnimationFrame(animateOpening);
          } else {
            // Phase 3: Camera flies inside (3-6s) — animate frames 120 to 239
            setDoorPhase('entering');
            const enterStart = performance.now();
            const enterDuration = 3000;

            const animateEntering = (t: number) => {
              const elapsed2 = t - enterStart;
              const enterProgress = Math.min(elapsed2 / enterDuration, 1);
              const eased2 = 1 - Math.pow(1 - enterProgress, 2);
              setFrameProgress(0.5 + eased2 * 0.5); // 0.5 to 1.0 maps to frames 120–239

              if (enterProgress < 1) {
                animationRef.current = requestAnimationFrame(animateEntering);
              } else {
                // Complete — transition to exploring
                setTimeout(() => {
                  onLoginSuccess(user);
                }, 500);
              }
            }

            animationRef.current = requestAnimationFrame(animateEntering);
          }
        }

        animationRef.current = requestAnimationFrame(animateOpening);
      }, 1000);
    },
    [onLoginSuccess]
  );

  // Cleanup animation on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);

      // Simulate network delay for premium feel
      await new Promise((resolve) => setTimeout(resolve, 600));

      let result;
      if (mode === 'register') {
        result = registerUser(displayName, email, password);
      } else {
        result = loginUser(email, password);
      }

      if (!result.success || !result.user) {
        setError(result.error || 'Authentication failed.');
        setIsSubmitting(false);
        return;
      }

      // Success — trigger door animation
      setIsSubmitting(false);
      animateDoorOpen(result.user);
    },
    [mode, email, password, displayName, animateDoorOpen]
  );

  const isDoorAnimating = doorPhase !== 'idle';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50"
    >
      {/* Hero Frame Background */}
      <div className="absolute inset-0">
        <HeroFrameSequence progress={frameProgress} />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-space/90 via-deep-space/30 to-deep-space/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-space/40 via-transparent to-deep-space/40" />
      </div>

      {/* Lock Mechanism Animation */}
      <AnimatePresence>
        {doorPhase === 'unlocking' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full border-2 border-luxury-gold/50"
                style={{
                  boxShadow: '0 0 40px rgba(245, 196, 81, 0.4), inset 0 0 20px rgba(245, 196, 81, 0.1)',
                }}
              />
              {/* Center lock icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute inset-0 flex items-center justify-center text-luxury-gold text-3xl"
              >
                🔓
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entering Villa Overlay */}
      <AnimatePresence>
        {doorPhase === 'entering' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl mb-4"
              >
                🏛️
              </motion.div>
              <HologramText as="h2" className="text-2xl md:text-3xl mb-2">
                Welcome to the Villa
              </HologramText>
              <p className="text-white/30 text-sm font-body">
                Entering premium learning environment...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Panel — hidden during door animation */}
      <AnimatePresence>
        {!isDoorAnimating && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md glass-surface-heavy rounded-3xl overflow-hidden"
              style={{
                boxShadow:
                  '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Header */}
              <div className="relative px-8 pt-10 pb-6 text-center">
                {/* Decorative top line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-ai-blue to-transparent" />

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-4xl mb-4"
                >
                  🏛️
                </motion.div>

                <HologramText as="h1" className="text-2xl md:text-3xl mb-1.5">
                  Flying AI Villa
                </HologramText>
                <p className="text-white/30 text-xs font-body tracking-[0.2em] uppercase">
                  {mode === 'login' ? 'Enter the Academy' : 'Create Your Identity'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                {/* Name field (register only) */}
                <AnimatePresence mode="popLayout">
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="displayName" className="sr-only">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-ai-blue transition-colors" />
                        <input
                          id="displayName"
                          type="text"
                          placeholder="Full Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 text-sm font-body focus:outline-none focus:border-ai-blue/50 focus:bg-white/[0.06] transition-all duration-300"
                          autoComplete="name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-ai-blue transition-colors" />
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 text-sm font-body focus:outline-none focus:border-ai-blue/50 focus:bg-white/[0.06] transition-all duration-300"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-ai-blue transition-colors" />
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 text-sm font-body focus:outline-none focus:border-ai-blue/50 focus:bg-white/[0.06] transition-all duration-300"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-red-300/80 text-xs font-body">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-premium py-3.5 px-6 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Enter Villa' : 'Create Identity'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                {/* Toggle Mode */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    className="text-white/30 hover:text-ai-blue-light text-xs font-body transition-colors"
                  >
                    {mode === 'login'
                      ? "Don't have access? Register here"
                      : 'Already a resident? Login'}
                  </button>
                </div>
              </form>

              {/* Bottom decorative line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
