'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  type UserProgress,
  type CourseProgress,
  loadProgress,
  saveProgress,
  createCourseProgress,
  calculateOverallProgress,
  syncProgressToFirestore,
} from '@/utils/progress';
import {
  type CertificateData,
  createCertificate,
  saveCertificate,
  getCertificateForCourse,
} from '@/utils/certificate';
import { COURSES } from '@/utils/courses';

export function useProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<UserProgress>({
    userId: '',
    courses: {},
    lastUpdated: new Date().toISOString(),
  });

  // Load progress when userId changes
  useEffect(() => {
    if (!userId) return;
    const loaded = loadProgress(userId);
    setProgress(loaded);
  }, [userId]);

  // Persist whenever progress changes
  const persist = useCallback(
    (updated: UserProgress) => {
      setProgress(updated);
      saveProgress(updated);
      // Sync to Firebase in background
      syncProgressToFirestore(updated);
    },
    []
  );

  // Start a course
  const startCourse = useCallback(
    (courseId: string) => {
      setProgress((prev) => {
        const updated = { ...prev, courses: { ...prev.courses } };
        if (!updated.courses[courseId]) {
          updated.courses[courseId] = createCourseProgress(courseId);
        }
        updated.courses[courseId] = {
          ...updated.courses[courseId],
          started: true,
          startedAt: updated.courses[courseId].startedAt || new Date().toISOString(),
        };
        saveProgress(updated);
        return updated;
      });
    },
    []
  );

  // Update watch progress
  const setWatchProgress = useCallback(
    (courseId: string, pct: number) => {
      setProgress((prev) => {
        const updated = { ...prev, courses: { ...prev.courses } };
        if (!updated.courses[courseId]) {
          updated.courses[courseId] = createCourseProgress(courseId);
        }
        updated.courses[courseId] = {
          ...updated.courses[courseId],
          watchProgress: Math.min(100, Math.max(0, pct)),
        };
        saveProgress(updated);
        return updated;
      });
    },
    []
  );

  // Complete a course and generate certificate
  const completeCourse = useCallback(
    (courseId: string): CertificateData | null => {
      if (!userId) return null;

      const course = COURSES.find((c) => c.id === courseId);
      if (!course) return null;

      // Check if certificate already exists
      const existing = getCertificateForCourse(userId, courseId);
      if (existing) return existing;

      // Generate new certificate
      const cert = createCertificate(
        courseId,
        course.title,
        progress.courses[courseId]?.courseId ? '' : '' // userName will be passed separately
      );

      setProgress((prev) => {
        const updated = { ...prev, courses: { ...prev.courses } };
        if (!updated.courses[courseId]) {
          updated.courses[courseId] = createCourseProgress(courseId);
        }
        updated.courses[courseId] = {
          ...updated.courses[courseId],
          completed: true,
          completedAt: new Date().toISOString(),
          watchProgress: 100,
          certificateId: cert.id,
        };
        saveProgress(updated);
        return updated;
      });

      return cert;
    },
    [userId, progress]
  );

  // Get specific course progress
  const getCourseProgress = useCallback(
    (courseId: string): CourseProgress => {
      return progress.courses[courseId] || createCourseProgress(courseId);
    },
    [progress]
  );

  // Overall progress percentage
  const overallProgress = calculateOverallProgress(progress, COURSES.length);

  return {
    progress,
    startCourse,
    setWatchProgress,
    completeCourse,
    getCourseProgress,
    overallProgress,
  };
}
