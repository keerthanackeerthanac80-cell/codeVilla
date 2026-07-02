'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  Award,
  Download,
  Clock,
  BookOpen,
} from 'lucide-react';
import type { Course } from '@/utils/courses';
import type { CourseProgress } from '@/utils/progress';
import GlassPanel from '@/components/ui/GlassPanel';
import HologramText from '@/components/ui/HologramText';
import CertificateGenerator from '@/components/certificate/CertificateGenerator';
import {
  createCertificate,
  saveCertificate,
  getCertificateForCourse,
  type CertificateData,
} from '@/utils/certificate';

interface CourseVideoRoomProps {
  course: Course;
  progress: CourseProgress;
  userId: string;
  userName: string;
  onBack: () => void;
  onProgressUpdated: (pct: number, completed: boolean, certificateId?: string) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function CourseVideoRoom({
  course,
  progress,
  userId,
  userName,
  onBack,
  onProgressUpdated,
}: CourseVideoRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchPct, setWatchPct] = useState(progress.watchProgress);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [simulatedProgress, setSimulatedProgress] = useState(progress.watchProgress);

  const isYouTube = course.videoSrc.includes('youtube.com') || course.videoSrc.includes('youtu.be');
  const ytId = isYouTube ? getYouTubeId(course.videoSrc) : null;
  const [ytPlayer, setYtPlayer] = useState<any>(null);

  // Check for existing certificate
  useEffect(() => {
    const existing = getCertificateForCourse(userId, course.id);
    if (existing) setCertificate(existing);
  }, [userId, course.id]);

  // Load YouTube Player API and initialize player
  useEffect(() => {
    if (!isYouTube || !ytId) {
      setYtPlayer(null);
      return;
    }

    let player: any;

    const initYT = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initYT, 100);
        return;
      }

      const el = document.getElementById('youtube-player-container');
      if (!el) {
        setTimeout(initYT, 100);
        return;
      }

      player = new window.YT.Player('youtube-player-container', {
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            setYtPlayer(event.target);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === 1) { // playing
              setIsPlaying(true);
            } else if (state === 2) { // paused
              setIsPlaying(false);
            } else if (state === 0) { // ended
              setIsPlaying(false);
              setWatchPct(100);
              onProgressUpdated(100, true);
            }
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    initYT();

    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [course.id, isYouTube, ytId]);

  // Sync volume state with YouTube Player
  useEffect(() => {
    if (isYouTube && ytPlayer) {
      if (isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
      }
    }
  }, [isMuted, isYouTube, ytPlayer]);

  // Track YouTube Player current time and progress updates
  useEffect(() => {
    if (!isYouTube || !ytPlayer || !isPlaying) return;

    const interval = setInterval(() => {
      if (ytPlayer.getCurrentTime) {
        const time = ytPlayer.getCurrentTime();
        setCurrentTime(time);
        if (duration) {
          const pct = (time / duration) * 100;
          setWatchPct(pct);
          onProgressUpdated(pct, false);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isYouTube, ytPlayer, isPlaying, duration, onProgressUpdated]);

  // Handle HTML5 video events
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const pct = (video.currentTime / duration) * 100;
    setCurrentTime(video.currentTime);
    setWatchPct(pct);
    onProgressUpdated(pct, false);
  }, [duration, onProgressUpdated]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoAvailable(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isYouTube) {
      if (ytPlayer) {
        const state = ytPlayer.getPlayerState();
        if (state === 1) { // playing
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      }
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isYouTube, ytPlayer]);

  const toggleMute = useCallback(() => {
    if (isYouTube) {
      setIsMuted((prev) => !prev);
      return;
    }
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, isYouTube]);

  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (isYouTube) {
      if (ytPlayer) {
        const current = ytPlayer.getCurrentTime();
        ytPlayer.seekTo(Math.min(duration, Math.max(0, current + seconds)), true);
      }
      return;
    }
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + seconds));
    }
  }, [isYouTube, ytPlayer, duration]);

  // Simulate progress for demo mode (no video file and not YouTube)
  useEffect(() => {
    if (isYouTube || videoAvailable) return;
    // Auto-advance simulated progress when playing
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        const next = Math.min(100, prev + 0.5);
        setWatchPct(next);
        onProgressUpdated(next, false);
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [videoAvailable, isYouTube, isPlaying, onProgressUpdated]);

  // Handle course completion
  const handleComplete = useCallback(() => {
    const existing = getCertificateForCourse(userId, course.id);
    if (existing) {
      setCertificate(existing);
      setShowCertificate(true);
      onProgressUpdated(100, true, existing.id);
      return;
    }

    const cert = createCertificate(course.id, course.title, userName);
    saveCertificate(userId, cert);
    setCertificate(cert);
    setShowCertificate(true);
    onProgressUpdated(100, true, cert.id);
  }, [userId, course, userName, onProgressUpdated]);

  const formatTime = (t: number): string => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canComplete = watchPct >= 90 || simulatedProgress >= 90;
  const effectiveProgress = (isYouTube || videoAvailable) ? watchPct : simulatedProgress;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-deep-space"
    >
      <div className="h-full flex flex-col lg:flex-row">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 md:p-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-body transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Villa
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{course.icon}</span>
              <span className="text-white/50 text-sm font-heading hidden md:block">
                {course.shortTitle}
              </span>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-4">
            <div ref={playerContainerRef} className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden glass-surface">
              {isYouTube ? (
                <div className="w-full h-full" id="youtube-player-container" />
              ) : videoAvailable ? (
                <video
                  ref={videoRef}
                  src={course.videoSrc}
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleVideoError}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />
              ) : (
                /* Demo mode — no video file */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-deep-space-light to-deep-space">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-6xl mb-4"
                  >
                    {course.icon}
                  </motion.div>
                  <HologramText as="h3" className="text-xl mb-2">
                    {course.title}
                  </HologramText>
                  <p className="text-white/30 text-xs mb-6">
                    {isPlaying ? 'Simulating course progress...' : 'Click play to begin the course simulation'}
                  </p>

                  {/* Simulated progress */}
                  <div className="w-3/4 max-w-sm">
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${simulatedProgress}%`,
                          background: course.gradient,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-white/20 text-[10px]">Course simulation</span>
                      <span className="text-white/30 text-[10px] font-heading">
                        {Math.round(simulatedProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Play overlay */}
              {!isPlaying && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (isYouTube) togglePlay();
                    else if (videoAvailable) togglePlay();
                    else setIsPlaying(true);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors z-10"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: course.gradient,
                      boxShadow: `0 0 30px rgba(${course.colorRgb}, 0.5)`,
                    }}
                  >
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </motion.button>
              )}

              {/* Translucent click handler layer when playing YouTube to toggle play/pause */}
              {isYouTube && isPlaying && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer bg-transparent"
                  onClick={togglePlay}
                />
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="px-4 md:px-8 pb-4 md:pb-6">
            <div className="max-w-4xl mx-auto glass-surface rounded-xl px-4 py-3">
              {/* Progress bar */}
              <div className="mb-2">
                <div
                  className="h-1 rounded-full bg-white/5 overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    if (isYouTube) {
                      if (ytPlayer && duration) {
                        ytPlayer.seekTo(pct * duration, true);
                      }
                      return;
                    }
                    if (!videoAvailable) return;
                    if (videoRef.current) {
                      videoRef.current.currentTime = pct * duration;
                    }
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${effectiveProgress}%`,
                      background: course.gradient,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isYouTube || videoAvailable) togglePlay();
                      else setIsPlaying(!isPlaying);
                    }}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-all"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  {(isYouTube || videoAvailable) && (
                    <>
                      <button
                        onClick={() => skip(10)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                        aria-label="Skip 10 seconds"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <button
                        onClick={toggleMute}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </>
                  )}

                  <span className="text-white/30 text-xs font-body tabular-nums ml-2">
                    {(isYouTube || videoAvailable) ? `${formatTime(currentTime)} / ${formatTime(duration)}` : `${Math.round(effectiveProgress)}% complete`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {canComplete && !progress.completed && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleComplete}
                      className="btn-gold px-4 py-1.5 text-xs flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Complete & Get Certificate
                    </motion.button>
                  )}

                  {progress.completed && certificate && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowCertificate(true)}
                      className="px-4 py-1.5 rounded-lg bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-xs flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      View Certificate
                    </motion.button>
                  )}

                  {(isYouTube || videoAvailable) && (
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                      aria-label="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — Course Info */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-white/5 overflow-y-auto scrollbar-villa">
          <div className="p-6 space-y-6">
            {/* Course Title */}
            <div>
              <div className="text-3xl mb-2">{course.icon}</div>
              <h2 className="font-heading font-bold text-lg text-white mb-1">
                {course.title}
              </h2>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                {course.duration}
                <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                {course.difficulty}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/30 text-xs font-body">Your Progress</span>
                <span className="text-white/50 text-xs font-heading font-bold">
                  {Math.round(effectiveProgress)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${effectiveProgress}%`,
                    background: effectiveProgress >= 100
                      ? 'linear-gradient(90deg, #F5C451, #D97706)'
                      : course.gradient,
                  }}
                />
              </div>
            </div>

            {/* Modules */}
            <div>
              <h3 className="flex items-center gap-2 text-white/40 text-xs font-heading font-bold uppercase tracking-wider mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                Modules
              </h3>
              <div className="space-y-1.5">
                {course.topics.map((topic, i) => {
                  const topicProgress = (effectiveProgress / 100) * course.topics.length;
                  const isDone = i < topicProgress;
                  return (
                    <div
                      key={topic}
                      className="flex items-center gap-2 py-1.5 text-xs font-body"
                    >
                      <CheckCircle
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{
                          color: isDone ? course.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                      <span className={isDone ? 'text-white/50' : 'text-white/20'}>
                        {topic}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-white/25 text-xs font-body leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && certificate && (
          <CertificateGenerator
            certificate={certificate}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
