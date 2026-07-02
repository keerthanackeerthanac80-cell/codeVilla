// ============================================
// PROGRESS TRACKING — FLYING AI LEARNING VILLA
// Persisted to localStorage per user
// ============================================

export interface CourseProgress {
  courseId: string;
  started: boolean;
  startedAt?: string;
  watchProgress: number;  // 0–100
  completed: boolean;
  completedAt?: string;
  certificateId?: string;
}

export interface UserProgress {
  userId: string;
  courses: Record<string, CourseProgress>;
  lastUpdated: string;
}

const PROGRESS_PREFIX = 'villa_progress_';

function getProgressKey(userId: string): string {
  return PROGRESS_PREFIX + userId;
}

export function loadProgress(userId: string): UserProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress(userId);
  }
  try {
    const data = localStorage.getItem(getProgressKey(userId));
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // Ignore parse errors
  }
  return createEmptyProgress(userId);
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  progress.lastUpdated = new Date().toISOString();
  localStorage.setItem(getProgressKey(progress.userId), JSON.stringify(progress));
}

export function createEmptyProgress(userId: string): UserProgress {
  return {
    userId,
    courses: {},
    lastUpdated: new Date().toISOString(),
  };
}

export function createCourseProgress(courseId: string): CourseProgress {
  return {
    courseId,
    started: false,
    watchProgress: 0,
    completed: false,
  };
}

export function calculateOverallProgress(progress: UserProgress, totalCourses: number): number {
  const entries = Object.values(progress.courses);
  if (entries.length === 0 || totalCourses === 0) return 0;

  const totalProgress = entries.reduce((sum, cp) => sum + cp.watchProgress, 0);
  return Math.round(totalProgress / totalCourses);
}

export function getCompletedCourseIds(progress: UserProgress): string[] {
  return Object.entries(progress.courses)
    .filter(([, cp]) => cp.completed)
    .map(([id]) => id);
}

export function getInProgressCourseIds(progress: UserProgress): string[] {
  return Object.entries(progress.courses)
    .filter(([, cp]) => cp.started && !cp.completed)
    .map(([id]) => id);
}
