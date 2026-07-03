'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVideoAnalyticsForUser, getAttendanceForUser } from '@/lib/db-service';
import { loadProgressFromFirestore } from '@/lib/db-service';
import type { FirestoreVideoAnalytics, FirestoreAttendance, FirestoreCourseProgress } from '@/lib/firestore-types';
import { isFirebaseConfigured } from '@/lib/firebase';

export interface StudentAnalytics {
  totalHoursStudied: number;
  dailyLearningMinutes: number;
  weeklyLearningHours: number;
  monthlyLearningHours: number;
  currentStreak: number;
  longestStreak: number;
  certificatesEarned: number;
  completedVideos: number;
  remainingVideos: number;
  lastLoginDate: string;
  learningLevel: string;
  learningCalendar: { date: string; minutes: number }[];
  weeklyData: { label: string; hours: number }[];
}

export function useStudentAnalytics(userId: string | undefined): {
  analytics: StudentAnalytics | null;
  isLoading: boolean;
} {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      // Generate mock analytics for demo
      setAnalytics({
        totalHoursStudied: 0,
        dailyLearningMinutes: 0,
        weeklyLearningHours: 0,
        monthlyLearningHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        certificatesEarned: 0,
        completedVideos: 0,
        remainingVideos: 8,
        lastLoginDate: new Date().toISOString(),
        learningLevel: 'Beginner',
        learningCalendar: [],
        weeklyData: Array.from({ length: 7 }, (_, i) => ({
          label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          hours: 0,
        })),
      });
      setIsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const [videoAnalytics, attendance, progress] = await Promise.all([
          getVideoAnalyticsForUser(userId),
          getAttendanceForUser(userId),
          loadProgressFromFirestore(userId),
        ]);

        // Total hours
        const totalSeconds = videoAnalytics.reduce(
          (sum, v) => sum + (v.totalWatchTimeSeconds || 0),
          0
        );
        const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

        // Daily learning (today)
        const today = new Date().toISOString().split('T')[0];
        const todaySeconds = videoAnalytics
          .filter((v) => v.createdAt.startsWith(today))
          .reduce((sum, v) => sum + (v.totalWatchTimeSeconds || 0), 0);

        // Weekly
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const weekSeconds = videoAnalytics
          .filter((v) => v.createdAt >= weekAgo)
          .reduce((sum, v) => sum + (v.totalWatchTimeSeconds || 0), 0);

        // Monthly
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const monthSeconds = videoAnalytics
          .filter((v) => v.createdAt >= monthAgo)
          .reduce((sum, v) => sum + (v.totalWatchTimeSeconds || 0), 0);

        // Streak calculation
        const activeDates = new Set<string>();
        videoAnalytics.forEach((v) => {
          activeDates.add(v.createdAt.split('T')[0]);
        });
        let streak = 0;
        const now = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const ds = d.toISOString().split('T')[0];
          if (activeDates.has(ds)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        // Progress stats
        const completedCourses = progress.filter((p) => p.completed).length;
        const certificates = progress.filter((p) => p.certificateId).length;

        // Learning level
        let level = 'Beginner';
        if (totalHours >= 50) level = 'Expert';
        else if (totalHours >= 30) level = 'Advanced';
        else if (totalHours >= 15) level = 'Intermediate';
        else if (totalHours >= 5) level = 'Beginner+';

        // Learning calendar (last 30 days)
        const calendar: { date: string; minutes: number }[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const mins = videoAnalytics
            .filter((v) => v.createdAt.startsWith(dateStr))
            .reduce((sum, v) => sum + Math.round(v.totalWatchTimeSeconds / 60), 0);
          calendar.push({ date: dateStr, minutes: mins });
        }

        // Weekly breakdown
        const weeklyData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const ds = d.toISOString().split('T')[0];
          const hours = videoAnalytics
            .filter((v) => v.createdAt.startsWith(ds))
            .reduce((sum, v) => sum + v.totalWatchTimeSeconds / 3600, 0);
          return {
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            hours: Math.round(hours * 10) / 10,
          };
        });

        setAnalytics({
          totalHoursStudied: totalHours,
          dailyLearningMinutes: Math.round(todaySeconds / 60),
          weeklyLearningHours: Math.round((weekSeconds / 3600) * 10) / 10,
          monthlyLearningHours: Math.round((monthSeconds / 3600) * 10) / 10,
          currentStreak: streak,
          longestStreak: streak,
          certificatesEarned: certificates,
          completedVideos: completedCourses,
          remainingVideos: 8 - completedCourses,
          lastLoginDate: attendance[0]?.loginTime || new Date().toISOString(),
          learningLevel: level,
          learningCalendar: calendar,
          weeklyData,
        });
      } catch (err) {
        console.error('Failed to fetch student analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  return { analytics, isLoading };
}
