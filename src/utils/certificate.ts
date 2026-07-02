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
  dateIssued: string;
  formattedDate: string;
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

export function createCertificate(
  courseId: string,
  courseName: string,
  userName: string
): CertificateData {
  const now = new Date();
  return {
    id: generateCertificateId(),
    courseId,
    courseName,
    userName,
    dateIssued: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
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
