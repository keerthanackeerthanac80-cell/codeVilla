// ============================================
// ANALYTICS SERVICE — FLYING AI LEARNING VILLA
// Aggregated analytics queries for admin dashboard
// ============================================

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseDB, isFirebaseConfigured } from './firebase';
import type {
  FirestoreUser,
  FirestoreCourseProgress,
  FirestoreCertificate,
  FirestoreVideoAnalytics,
  FirestoreActivityLog,
  FirestoreAttendance,
  OverviewStats,
  StudentPerformanceScore,
  LearningTimeData,
  HeatmapCell,
} from './firestore-types';
import { COURSES } from '@/utils/courses';
import {
  MOCK_USERS,
  MOCK_COURSE_PROGRESS,
  MOCK_CERTIFICATES,
  MOCK_VIDEO_ANALYTICS,
  MOCK_ACTIVITY_LOGS,
  MOCK_NOTIFICATIONS,
  MOCK_ATTENDANCE
} from './mock-db-data';

// ---- Helper: get all docs from a collection ----
async function fetchAll<T>(collectionName: string): Promise<T[]> {
  if (!isFirebaseConfigured()) {
    if (collectionName === 'Users') return MOCK_USERS as unknown as T[];
    if (collectionName === 'CourseProgress') return MOCK_COURSE_PROGRESS as unknown as T[];
    if (collectionName === 'Certificates') return MOCK_CERTIFICATES as unknown as T[];
    if (collectionName === 'VideoAnalytics') return MOCK_VIDEO_ANALYTICS as unknown as T[];
    if (collectionName === 'ActivityLogs') return MOCK_ACTIVITY_LOGS as unknown as T[];
    if (collectionName === 'Notifications') return MOCK_NOTIFICATIONS as unknown as T[];
    if (collectionName === 'Attendance') return MOCK_ATTENDANCE as unknown as T[];
    return [] as T[];
  }
  try {
    const db = getFirebaseDB();
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  } catch {
    return [];
  }
}

// ============== OVERVIEW STATS ==============

export async function getOverviewStats(): Promise<OverviewStats> {
  const users = await fetchAll<FirestoreUser>('Users');
  const progress = await fetchAll<FirestoreCourseProgress>('CourseProgress');
  const certificates = await fetchAll<FirestoreCertificate>('Certificates');
  const videoAnalytics = await fetchAll<FirestoreVideoAnalytics>('VideoAnalytics');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Inactive = no login in 7+ days
  const activeUsers = users.filter((u) => u.lastLogin >= weekAgo);
  const inactiveUsers = users.filter((u) => u.lastLogin < weekAgo);

  // Completed = at least one course completed
  const completedUserIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.userId)
  );

  // Pending = started but not completed any course
  const startedUserIds = new Set(
    progress.filter((p) => p.started && !p.completed).map((p) => p.userId)
  );

  // Videos watched today
  const todayVideos = videoAnalytics.filter((v) => v.createdAt >= todayStart);

  // Average learning hours across all users
  const totalWatchSeconds = videoAnalytics.reduce(
    (sum, v) => sum + (v.totalWatchTimeSeconds || 0),
    0
  );
  const avgHours = users.length > 0 ? totalWatchSeconds / 3600 / users.length : 0;

  // Today's registrations
  const todayRegistrations = users.filter((u) => u.registrationDate >= todayStart);
  const monthlyRegistrations = users.filter((u) => u.registrationDate >= monthAgo);

  // Weekly active users
  const weeklyActive = users.filter((u) => u.lastLogin >= weekAgo);

  return {
    registeredMembers: users.length,
    activeMembers: activeUsers.length,
    inactiveMembers: inactiveUsers.length,
    completedStudents: completedUserIds.size,
    pendingStudents: startedUserIds.size,
    certificatesIssued: certificates.length,
    coursesAvailable: COURSES.length,
    videosWatchedToday: todayVideos.length,
    averageLearningHours: Math.round(avgHours * 10) / 10,
    todaysRegistrations: todayRegistrations.length,
    monthlyRegistrations: monthlyRegistrations.length,
    weeklyActivity: weeklyActive.length,
  };
}

// ============== REGISTRATION TRENDS ==============

export async function getRegistrationTrends(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  daysBack: number = 30
): Promise<LearningTimeData[]> {
  const users = await fetchAll<FirestoreUser>('Users');
  const now = new Date();
  const data: LearningTimeData[] = [];

  if (period === 'daily') {
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = users.filter((u) => u.registrationDate.startsWith(dateStr)).length;
      data.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: count,
      });
    }
  } else if (period === 'weekly') {
    for (let i = Math.floor(daysBack / 7) - 1; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const count = users.filter((u) => {
        const d = u.registrationDate;
        return d >= weekStart.toISOString() && d < weekEnd.toISOString();
      }).length;
      data.push({
        label: `Week ${Math.floor(daysBack / 7) - i}`,
        hours: count,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().slice(0, 7); // YYYY-MM
      const count = users.filter((u) => u.registrationDate.startsWith(monthStr)).length;
      data.push({
        label: month.toLocaleDateString('en-US', { month: 'short' }),
        hours: count,
      });
    }
  }

  return data;
}

// ============== COURSE ANALYTICS ==============

export interface CourseAnalyticsData {
  courseId: string;
  courseTitle: string;
  courseIcon: string;
  courseColor: string;
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  averageLearningHours: number;
  averageProgress: number;
}

export async function getCourseAnalytics(): Promise<CourseAnalyticsData[]> {
  const progress = await fetchAll<FirestoreCourseProgress>('CourseProgress');

  return COURSES.map((course) => {
    const courseProgress = progress.filter((p) => p.courseId === course.id);
    const enrolled = courseProgress.filter((p) => p.started).length;
    const completed = courseProgress.filter((p) => p.completed).length;
    const totalSeconds = courseProgress.reduce(
      (sum, p) => sum + (p.totalWatchTimeSeconds || 0),
      0
    );
    const avgProgress =
      courseProgress.length > 0
        ? courseProgress.reduce((sum, p) => sum + p.watchProgress, 0) / courseProgress.length
        : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseIcon: course.icon,
      courseColor: course.color,
      totalEnrolled: enrolled,
      totalCompleted: completed,
      completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      averageLearningHours: Math.round((totalSeconds / 3600) * 10) / 10,
      averageProgress: Math.round(avgProgress),
    };
  });
}

// ============== LEARNING HOURS CHART ==============

export async function getLearningHoursChart(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  daysBack: number = 30
): Promise<LearningTimeData[]> {
  const analytics = await fetchAll<FirestoreVideoAnalytics>('VideoAnalytics');
  const now = new Date();
  const data: LearningTimeData[] = [];

  if (period === 'daily') {
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const totalSeconds = analytics
        .filter((a) => a.createdAt.startsWith(dateStr))
        .reduce((sum, a) => sum + (a.totalWatchTimeSeconds || 0), 0);
      data.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.round((totalSeconds / 3600) * 10) / 10,
      });
    }
  } else if (period === 'weekly') {
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const totalSeconds = analytics
        .filter((a) => a.createdAt >= weekStart.toISOString() && a.createdAt < weekEnd.toISOString())
        .reduce((sum, a) => sum + (a.totalWatchTimeSeconds || 0), 0);
      data.push({
        label: `Week ${4 - i}`,
        hours: Math.round((totalSeconds / 3600) * 10) / 10,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().slice(0, 7);
      const totalSeconds = analytics
        .filter((a) => a.createdAt.startsWith(monthStr))
        .reduce((sum, a) => sum + (a.totalWatchTimeSeconds || 0), 0);
      data.push({
        label: month.toLocaleDateString('en-US', { month: 'short' }),
        hours: Math.round((totalSeconds / 3600) * 10) / 10,
      });
    }
  }

  return data;
}

// ============== STUDENT PERFORMANCE SCORE ==============

export async function getStudentPerformanceScore(
  userId: string
): Promise<StudentPerformanceScore | null> {
  const users = await fetchAll<FirestoreUser>('Users');
  const user = users.find((u) => u.uid === userId);
  if (!user) return null;

  const progress = (await fetchAll<FirestoreCourseProgress>('CourseProgress')).filter(
    (p) => p.userId === userId
  );
  const attendance = (await fetchAll<FirestoreAttendance>('Attendance')).filter(
    (a) => a.userId === userId
  );
  const videoAnalytics = (await fetchAll<FirestoreVideoAnalytics>('VideoAnalytics')).filter(
    (v) => v.userId === userId
  );

  // Attendance score: based on login frequency (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentLogins = attendance.filter((a) => a.createdAt >= thirtyDaysAgo).length;
  const attendanceScore = Math.min(100, (recentLogins / 30) * 100);

  // Watch time score: based on total hours (target = 20 hours for 100%)
  const totalSeconds = videoAnalytics.reduce(
    (sum, v) => sum + (v.totalWatchTimeSeconds || 0),
    0
  );
  const watchTimeScore = Math.min(100, (totalSeconds / 3600 / 20) * 100);

  // Completion score: percentage of courses completed
  const completedCourses = progress.filter((p) => p.completed).length;
  const completionScore = (completedCourses / COURSES.length) * 100;

  // Consistency score: how many of the last 7 days had activity
  const now = new Date();
  const activeDays = new Set<string>();
  videoAnalytics.forEach((v) => {
    const dayDiff = Math.floor(
      (now.getTime() - new Date(v.createdAt).getTime()) / (24 * 60 * 60 * 1000)
    );
    if (dayDiff < 7) {
      activeDays.add(v.createdAt.split('T')[0]);
    }
  });
  const consistencyScore = (activeDays.size / 7) * 100;

  // Overall score (weighted)
  const overallScore = Math.round(
    attendanceScore * 0.2 +
    watchTimeScore * 0.3 +
    completionScore * 0.3 +
    consistencyScore * 0.2
  );

  // Performance level
  let level: StudentPerformanceScore['level'];
  if (overallScore >= 85) level = 'Excellent';
  else if (overallScore >= 70) level = 'Very Good';
  else if (overallScore >= 50) level = 'Good';
  else if (overallScore >= 30) level = 'Needs Improvement';
  else level = 'At Risk';

  return {
    userId,
    userName: user.fullName || user.displayName,
    attendanceScore: Math.round(attendanceScore),
    watchTimeScore: Math.round(watchTimeScore),
    completionScore: Math.round(completionScore),
    consistencyScore: Math.round(consistencyScore),
    overallScore,
    level,
  };
}

// ============== ALL STUDENTS PERFORMANCE ==============

export async function getAllStudentPerformances(): Promise<StudentPerformanceScore[]> {
  const users = await fetchAll<FirestoreUser>('Users');
  const progress = await fetchAll<FirestoreCourseProgress>('CourseProgress');
  const attendance = await fetchAll<FirestoreAttendance>('Attendance');
  const videoAnalytics = await fetchAll<FirestoreVideoAnalytics>('VideoAnalytics');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return users
    .filter((u) => u.role === 'student')
    .map((user) => {
      const userProgress = progress.filter((p) => p.userId === user.uid);
      const userAttendance = attendance.filter((a) => a.userId === user.uid);
      const userVideoAnalytics = videoAnalytics.filter((v) => v.userId === user.uid);

      const recentLogins = userAttendance.filter((a) => a.createdAt >= thirtyDaysAgo).length;
      const attendanceScore = Math.min(100, (recentLogins / 30) * 100);

      const totalSeconds = userVideoAnalytics.reduce(
        (sum, v) => sum + (v.totalWatchTimeSeconds || 0),
        0
      );
      const watchTimeScore = Math.min(100, (totalSeconds / 3600 / 20) * 100);

      const completedCourses = userProgress.filter((p) => p.completed).length;
      const completionScore = (completedCourses / COURSES.length) * 100;

      const activeDays = new Set<string>();
      userVideoAnalytics.forEach((v) => {
        const dayDiff = Math.floor(
          (now.getTime() - new Date(v.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        );
        if (dayDiff < 7) activeDays.add(v.createdAt.split('T')[0]);
      });
      const consistencyScore = (activeDays.size / 7) * 100;

      const overallScore = Math.round(
        attendanceScore * 0.2 +
        watchTimeScore * 0.3 +
        completionScore * 0.3 +
        consistencyScore * 0.2
      );

      let level: StudentPerformanceScore['level'];
      if (overallScore >= 85) level = 'Excellent';
      else if (overallScore >= 70) level = 'Very Good';
      else if (overallScore >= 50) level = 'Good';
      else if (overallScore >= 30) level = 'Needs Improvement';
      else level = 'At Risk';

      return {
        userId: user.uid,
        userName: user.fullName || user.displayName,
        attendanceScore: Math.round(attendanceScore),
        watchTimeScore: Math.round(watchTimeScore),
        completionScore: Math.round(completionScore),
        consistencyScore: Math.round(consistencyScore),
        overallScore,
        level,
      };
    });
}

// ============== ACTIVITY HEATMAP ==============

export async function getActivityHeatmap(): Promise<HeatmapCell[]> {
  const analytics = await fetchAll<FirestoreVideoAnalytics>('VideoAnalytics');
  const heatmap: HeatmapCell[] = [];

  // Initialize all cells
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmap.push({ day, hour, value: 0 });
    }
  }

  // Fill with data
  analytics.forEach((a) => {
    const date = new Date(a.createdAt);
    const day = date.getDay();
    const hour = date.getHours();
    const cell = heatmap.find((c) => c.day === day && c.hour === hour);
    if (cell) {
      cell.value += Math.round(a.totalWatchTimeSeconds / 60);
    }
  });

  return heatmap;
}
