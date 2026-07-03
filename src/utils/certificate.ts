// ============================================
// CERTIFICATE SYSTEM — FLYING AI LEARNING VILLA
// Auto-generated certificates with unique IDs
// ============================================

import { v4 as uuidv4 } from 'uuid';

export interface CertificateData {
  id: string;
  courseId: string;
  courseName: string;
  userName: string;
  userId?: string;
  dateIssued: string;
  completionDate?: string;
  formattedDate: string;
  serialNumber?: string;
  instructorSignature?: string;
  qrCodeData?: string;
  verificationUrl?: string;
}

const CERTS_PREFIX = 'villa_certs_';

function getCertsKey(userId: string): string {
  return CERTS_PREFIX + userId;
}

export function generateCertificateId(): string {
  const uuid = uuidv4();
  // Format: VILLA-XXXX-XXXX-XXXX
  const short = uuid.replace(/-/g, '').substring(0, 12).toUpperCase();
  return `VILLA-${short.slice(0, 4)}-${short.slice(4, 8)}-${short.slice(8, 12)}`;
}

function generateSerialNumber(): string {
  return `SN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function createCertificate(
  courseId: string,
  courseName: string,
  userName: string,
  userId?: string
): CertificateData {
  const now = new Date();
  const certId = generateCertificateId();
  return {
    id: certId,
    courseId,
    courseName,
    userName,
    userId,
    dateIssued: now.toISOString(),
    completionDate: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    serialNumber: generateSerialNumber(),
    instructorSignature: 'Flying AI Villa Academy',
    qrCodeData: `https://flyingvilla.academy/verify/${certId}`,
    verificationUrl: `https://flyingvilla.academy/verify/${certId}`,
  };
}

export function saveCertificate(userId: string, cert: CertificateData): void {
  if (typeof window === 'undefined') return;
  const certs = loadCertificates(userId);
  // Don't duplicate
  if (!certs.some((c) => c.courseId === cert.courseId)) {
    certs.push(cert);
    localStorage.setItem(getCertsKey(userId), JSON.stringify(certs));
  }

  // Also save to Firebase
  syncCertificateToFirestore(userId, cert);
}

export function loadCertificates(userId: string): CertificateData[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getCertsKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getCertificateForCourse(
  userId: string,
  courseId: string
): CertificateData | undefined {
  return loadCertificates(userId).find((c) => c.courseId === courseId);
}

// ============================================
// FIREBASE CERTIFICATE SYNC
// ============================================

import { saveCertificateToFirestore } from '@/lib/db-service';
import { createNotification, logActivity } from '@/lib/db-service';
import { isFirebaseConfigured } from '@/lib/firebase';
import type { FirestoreCertificate } from '@/lib/firestore-types';

async function syncCertificateToFirestore(
  userId: string,
  cert: CertificateData
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const firestoreCert: FirestoreCertificate = {
      id: cert.id,
      courseId: cert.courseId,
      courseName: cert.courseName,
      userId,
      userName: cert.userName,
      dateIssued: cert.dateIssued,
      completionDate: cert.completionDate || cert.dateIssued,
      formattedDate: cert.formattedDate,
      serialNumber: cert.serialNumber || '',
      instructorSignature: cert.instructorSignature || 'Flying AI Villa Academy',
      qrCodeData: cert.qrCodeData,
      verificationUrl: cert.verificationUrl || '',
      createdAt: new Date().toISOString(),
    };
    await saveCertificateToFirestore(firestoreCert);

    // Log activity and notification
    logActivity(userId, cert.userName, 'downloaded_certificate',
      `${cert.userName} earned certificate for ${cert.courseName}`,
      { courseId: cert.courseId, courseName: cert.courseName }
    );
    createNotification('certificate_generated', 'Certificate Generated',
      `${cert.userName} earned a certificate for ${cert.courseName}`,
      { userId, userName: cert.userName, courseId: cert.courseId, courseName: cert.courseName }
    );
  } catch (err) {
    console.error('Failed to sync certificate to Firestore:', err);
  }
}

