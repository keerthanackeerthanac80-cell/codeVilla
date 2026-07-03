// ============================================
// FIRESTORE COLLECTION TYPES — FLYING AI LEARNING VILLA
// TypeScript interfaces for all 9 Firestore collections
// ============================================

import { Timestamp } from 'firebase/firestore';

// ---- 1. Users Collection ----
export type Gender = 'Male' | 'Female' | 'Other';
export type Degree =
  | 'B.Tech'
  | 'M.Tech'
  | 'BCA'
  | 'MCA'
  | 'BSc'
  | 'MSc'
  | 'Diploma'
  | 'PhD'
  | 'Working Professional'
  | 'Other';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type UserRole = 'student' | 'admin';

export interface FirestoreUser {
  uid: string;
  fullName: string;
  email: string;
  gender?: Gender;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  currentDegree?: Degree;
  collegeOrCompany?: string;
  yearOfStudy?: string;
  profilePhotoUrl?: string;
  currentCourseId?: string;
  accountStatus: AccountStatus;
  role: UserRole;
  registrationDate: string;
  lastLogin: string;
  avatarInitials: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

// ---- 2. Courses Collection ----
export interface FirestoreCourse {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  colorRgb: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  totalEnrolled: number;
  totalCompleted: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

// ---- 3. CourseProgress Collection ----
export interface FirestoreCourseProgress {
  id?: string;
  userId: string;
  courseId: string;
  started: boolean;
  startedAt?: string;
  watchProgress: number; // 0–100
  completed: boolean;
  completedAt?: string;
  certificateId?: string;
  totalWatchTimeSeconds: number;
  lastViewedAt?: string;
  updatedAt: string;
}

// ---- 4. Certificates Collection ----
export interface FirestoreCertificate {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  dateIssued: string;
  completionDate: string;
  formattedDate: string;
  serialNumber: string;
  instructorSignature: string;
  qrCodeData?: string;
  verificationUrl: string;
  createdAt: string;
}

// ---- 5. Attendance Collection ----
export interface FirestoreAttendance {
  id?: string;
  userId: string;
  loginTime: string;
  logoutTime?: string;
  sessionDurationMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ---- 6. VideoAnalytics Collection ----
export interface FirestoreVideoAnalytics {
  id?: string;
  videoId: string;
  courseId: string;
  userId: string;
  watchStartTime: string;
  watchEndTime?: string;
  totalWatchTimeSeconds: number;
  completionPercentage: number;
  pausedDurationSeconds: number;
  resumeCount: number;
  fastForwardCount: number;
  replayCount: number;
  lastViewedPosition: number;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- 7. Notifications Collection ----
export type NotificationType =
  | 'new_registration'
  | 'course_completion'
  | 'certificate_generated'
  | 'inactive_student'
  | 'low_activity'
  | 'support_request';

export interface FirestoreNotification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  courseId?: string;
  courseName?: string;
  read: boolean;
  createdAt: string;
}

// ---- 8. ActivityLogs Collection ----
export type ActivityType =
  | 'enrolled'
  | 'completed_course'
  | 'watched_video'
  | 'downloaded_certificate'
  | 'logged_in'
  | 'registered'
  | 'profile_updated';

export interface FirestoreActivityLog {
  id?: string;
  userId: string;
  userName: string;
  type: ActivityType;
  description: string;
  courseId?: string;
  courseName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---- 9. AdminSettings Collection ----
export interface FirestoreAdminSettings {
  id?: string;
  siteName: string;
  certificateInstructorName: string;
  certificateInstructorTitle: string;
  notificationsEnabled: boolean;
  autoGenerateCertificates: boolean;
  inactivityThresholdDays: number;
  lowActivityThresholdHours: number;
  updatedAt: string;
  updatedBy: string;
}

// ---- Aggregated Analytics Types ----
export interface OverviewStats {
  registeredMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  completedStudents: number;
  pendingStudents: number;
  certificatesIssued: number;
  coursesAvailable: number;
  videosWatchedToday: number;
  averageLearningHours: number;
  todaysRegistrations: number;
  monthlyRegistrations: number;
  weeklyActivity: number;
}

export interface StudentPerformanceScore {
  userId: string;
  userName: string;
  attendanceScore: number;     // 0–100
  watchTimeScore: number;      // 0–100
  completionScore: number;     // 0–100
  consistencyScore: number;    // 0–100
  overallScore: number;        // 0–100
  level: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'At Risk';
}

export interface LearningTimeData {
  label: string;
  hours: number;
}

export interface HeatmapCell {
  day: number;     // 0 (Sun) – 6 (Sat)
  hour: number;    // 0–23
  value: number;   // minutes
}
