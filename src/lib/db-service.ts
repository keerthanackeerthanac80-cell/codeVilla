// ============================================
// FIREBASE DB SERVICE — FLYING AI LEARNING VILLA
// CRUD operations for all Firestore collections
// ============================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import { getFirebaseDB, isFirebaseConfigured } from './firebase';
import type {
  FirestoreUser,
  FirestoreCourseProgress,
  FirestoreCertificate,
  FirestoreVideoAnalytics,
  FirestoreNotification,
  FirestoreActivityLog,
  FirestoreAttendance,
  NotificationType,
  ActivityType,
} from './firestore-types';
import {
  MOCK_USERS,
  MOCK_COURSE_PROGRESS,
  MOCK_CERTIFICATES,
  MOCK_VIDEO_ANALYTICS,
  MOCK_ACTIVITY_LOGS,
  MOCK_NOTIFICATIONS,
  MOCK_ATTENDANCE
} from './mock-db-data';

// ============== USER OPERATIONS ==============

export async function getAllUsers(): Promise<FirestoreUser[]> {
  if (!isFirebaseConfigured()) return MOCK_USERS;
  try {
    const db = getFirebaseDB();
    const snapshot = await getDocs(collection(db, 'Users'));
    return snapshot.docs.map((d) => d.data() as FirestoreUser);
  } catch {
    return [];
  }
}

export async function getUsersByFilter(
  filters: { field: string; operator: any; value: any }[]
): Promise<FirestoreUser[]> {
  if (!isFirebaseConfigured()) {
    let results = [...MOCK_USERS];
    for (const f of filters) {
      results = results.filter((item: any) => {
        const val = item[f.field];
        if (f.operator === '==') return val === f.value;
        if (f.operator === '>=') return val >= f.value;
        if (f.operator === '<=') return val <= f.value;
        return true;
      });
    }
    return results;
  }
  try {
    const db = getFirebaseDB();
    const constraints: QueryConstraint[] = filters.map((f) =>
      where(f.field, f.operator, f.value)
    );
    const q = query(collection(db, 'Users'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as FirestoreUser);
  } catch {
    return [];
  }
}

// ============== COURSE PROGRESS ==============

export async function saveProgressToFirestore(
  userId: string,
  courseId: string,
  progressData: Partial<FirestoreCourseProgress>
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    const docId = `${userId}_${courseId}`;
    const existing = await getDoc(doc(db, 'CourseProgress', docId));

    if (existing.exists()) {
      await updateDoc(doc(db, 'CourseProgress', docId), {
        ...progressData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(doc(db, 'CourseProgress', docId), {
        userId,
        courseId,
        started: false,
        watchProgress: 0,
        completed: false,
        totalWatchTimeSeconds: 0,
        ...progressData,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Failed to save progress to Firestore:', err);
  }
}

export async function loadProgressFromFirestore(
  userId: string
): Promise<FirestoreCourseProgress[]> {
  if (!isFirebaseConfigured()) return MOCK_COURSE_PROGRESS.filter((p) => p.userId === userId);
  try {
    const db = getFirebaseDB();
    const q = query(collection(db, 'CourseProgress'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreCourseProgress);
  } catch {
    return [];
  }
}

export async function getAllCourseProgress(): Promise<FirestoreCourseProgress[]> {
  if (!isFirebaseConfigured()) return MOCK_COURSE_PROGRESS;
  try {
    const db = getFirebaseDB();
    const snapshot = await getDocs(collection(db, 'CourseProgress'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreCourseProgress);
  } catch {
    return [];
  }
}

// ============== CERTIFICATES ==============

export async function saveCertificateToFirestore(
  cert: FirestoreCertificate
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    await setDoc(doc(db, 'Certificates', cert.id), cert);
  } catch (err) {
    console.error('Failed to save certificate to Firestore:', err);
  }
}

export async function getCertificatesForUser(
  userId: string
): Promise<FirestoreCertificate[]> {
  if (!isFirebaseConfigured()) return MOCK_CERTIFICATES.filter((c) => c.userId === userId);
  try {
    const db = getFirebaseDB();
    const q = query(collection(db, 'Certificates'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as FirestoreCertificate);
  } catch {
    return [];
  }
}

export async function getAllCertificates(): Promise<FirestoreCertificate[]> {
  if (!isFirebaseConfigured()) return MOCK_CERTIFICATES;
  try {
    const db = getFirebaseDB();
    const snapshot = await getDocs(collection(db, 'Certificates'));
    return snapshot.docs.map((d) => d.data() as FirestoreCertificate);
  } catch {
    return [];
  }
}

export async function verifyCertificate(
  certId: string
): Promise<FirestoreCertificate | null> {
  if (!isFirebaseConfigured()) return MOCK_CERTIFICATES.find((c) => c.id === certId) || null;
  try {
    const db = getFirebaseDB();
    const certDoc = await getDoc(doc(db, 'Certificates', certId));
    return certDoc.exists() ? (certDoc.data() as FirestoreCertificate) : null;
  } catch {
    return null;
  }
}

// ============== VIDEO ANALYTICS ==============

export async function logVideoEvent(
  analytics: Omit<FirestoreVideoAnalytics, 'id'>
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    await addDoc(collection(db, 'VideoAnalytics'), analytics);
  } catch (err) {
    console.error('Failed to log video event:', err);
  }
}

export async function getVideoAnalyticsForUser(
  userId: string
): Promise<FirestoreVideoAnalytics[]> {
  if (!isFirebaseConfigured()) return MOCK_VIDEO_ANALYTICS.filter((v) => v.userId === userId);
  try {
    const db = getFirebaseDB();
    const q = query(collection(db, 'VideoAnalytics'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreVideoAnalytics);
  } catch {
    return [];
  }
}

export async function getAllVideoAnalytics(): Promise<FirestoreVideoAnalytics[]> {
  if (!isFirebaseConfigured()) return MOCK_VIDEO_ANALYTICS;
  try {
    const db = getFirebaseDB();
    const snapshot = await getDocs(collection(db, 'VideoAnalytics'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreVideoAnalytics);
  } catch {
    return [];
  }
}

// ============== ACTIVITY LOGS ==============

export async function logActivity(
  userId: string,
  userName: string,
  type: ActivityType,
  description: string,
  extra?: { courseId?: string; courseName?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    const log: Omit<FirestoreActivityLog, 'id'> = {
      userId,
      userName,
      type,
      description,
      courseId: extra?.courseId,
      courseName: extra?.courseName,
      metadata: extra?.metadata,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'ActivityLogs'), log);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export async function getRecentActivities(
  limitCount: number = 50
): Promise<FirestoreActivityLog[]> {
  if (!isFirebaseConfigured()) return MOCK_ACTIVITY_LOGS.slice(0, limitCount);
  try {
    const db = getFirebaseDB();
    const q = query(
      collection(db, 'ActivityLogs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreActivityLog);
  } catch {
    return [];
  }
}

export function subscribeToActivities(
  callback: (activities: FirestoreActivityLog[]) => void,
  limitCount: number = 20
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback(MOCK_ACTIVITY_LOGS.slice(0, limitCount));
    return () => {};
  }
  const db = getFirebaseDB();
  const q = query(
    collection(db, 'ActivityLogs'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as FirestoreActivityLog
    );
    callback(activities);
  });
}

// ============== NOTIFICATIONS ==============

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  extra?: { userId?: string; userName?: string; courseId?: string; courseName?: string }
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    const notification: Omit<FirestoreNotification, 'id'> = {
      type,
      title,
      message,
      userId: extra?.userId,
      userName: extra?.userName,
      courseId: extra?.courseId,
      courseName: extra?.courseName,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'Notifications'), notification);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function getAdminNotifications(
  limitCount: number = 50
): Promise<FirestoreNotification[]> {
  if (!isFirebaseConfigured()) return MOCK_NOTIFICATIONS.slice(0, limitCount);
  try {
    const db = getFirebaseDB();
    const q = query(
      collection(db, 'Notifications'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreNotification);
  } catch {
    return [];
  }
}

export async function markNotificationRead(notifId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    await updateDoc(doc(db, 'Notifications', notifId), { read: true });
  } catch {
    // Silently fail
  }
}

export function subscribeToNotifications(
  callback: (notifications: FirestoreNotification[]) => void,
  limitCount: number = 20
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback(MOCK_NOTIFICATIONS.slice(0, limitCount));
    return () => {};
  }
  const db = getFirebaseDB();
  const q = query(
    collection(db, 'Notifications'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as FirestoreNotification
    );
    callback(notifs);
  });
}

// ============== ATTENDANCE ==============

export async function logLoginAttendance(
  userId: string,
  userAgent?: string
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getFirebaseDB();
    const attendance: Omit<FirestoreAttendance, 'id'> = {
      userId,
      loginTime: new Date().toISOString(),
      userAgent,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'Attendance'), attendance);
  } catch (err) {
    console.error('Failed to log attendance:', err);
  }
}

export async function getAttendanceForUser(
  userId: string
): Promise<FirestoreAttendance[]> {
  if (!isFirebaseConfigured()) return MOCK_ATTENDANCE.filter((a) => a.userId === userId);
  try {
    const db = getFirebaseDB();
    const q = query(
      collection(db, 'Attendance'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FirestoreAttendance);
  } catch {
    return [];
  }
}
