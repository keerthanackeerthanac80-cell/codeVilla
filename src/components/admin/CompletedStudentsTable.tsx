'use client';

import { useEffect, useState } from 'react';
import { Download, Share2, Award, ExternalLink } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { getAllUsers, getAllCourseProgress, getAllCertificates } from '@/lib/db-service';
import type { FirestoreUser, FirestoreCourseProgress, FirestoreCertificate } from '@/lib/firestore-types';
import { COURSES } from '@/utils/courses';
import CertificateGenerator from '@/components/certificate/CertificateGenerator';
import type { CertificateData } from '@/utils/certificate';

interface CompletedStudentRow {
  uid: string;
  studentName: string;
  email: string;
  courseId: string;
  courseName: string;
  totalHours: number;
  completionDate: string;
  certificateNumber: string;
  certificateId: string;
  formattedDate: string;
}

export default function CompletedStudentsTable() {
  const [completedStudents, setCompletedStudents] = useState<CompletedStudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, progress, certs] = await Promise.all([
          getAllUsers(),
          getAllCourseProgress(),
          getAllCertificates(),
        ]);

        const rows: CompletedStudentRow[] = [];

        users
          .filter((u) => u.role !== 'admin')
          .forEach((u) => {
            const userProgress = progress.filter((p) => p.userId === u.uid);
            
            userProgress.forEach((p) => {
              // Only include completed courses
              if (p.completed) {
                const course = COURSES.find((c) => c.id === p.courseId);
                if (!course) return;

                const cert = certs.find((c) => c.userId === u.uid && c.courseId === p.courseId);
                const certificateNumber = cert?.serialNumber || cert?.id || '—';
                const certificateId = cert?.id || '';

                const totalHours = Math.round((p.totalWatchTimeSeconds || 0) / 3600 * 10) / 10;
                
                rows.push({
                  uid: u.uid,
                  studentName: u.fullName || u.displayName,
                  email: u.email,
                  courseId: p.courseId,
                  courseName: course.title,
                  totalHours: totalHours || parseFloat(course.duration.split(' ')[0]), // Fallback to course duration
                  completionDate: new Date(p.completedAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }),
                  certificateNumber,
                  certificateId,
                  formattedDate: new Date(p.completedAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                });
              }
            });
          });

        setCompletedStudents(rows);
      } catch (err) {
        console.error('Failed to fetch completed students:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenCertificate = (student: CompletedStudentRow) => {
    setSelectedCert({
      id: student.certificateId,
      courseId: student.courseId,
      courseName: student.courseName,
      userName: student.studentName,
      dateIssued: student.completionDate,
      formattedDate: student.formattedDate,
      serialNumber: student.certificateNumber,
      instructorSignature: 'Flying AI Villa Academy',
      qrCodeData: `https://flyingvilla.academy/verify/${student.certificateId}`,
      verificationUrl: `https://flyingvilla.academy/verify/${student.certificateId}`,
    });
  };

  const columns: Column<CompletedStudentRow>[] = [
    {
      key: 'studentName',
      header: 'Student Name',
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-white/70 font-heading font-semibold text-[11px]">
            {item.studentName}
          </p>
          <p className="text-white/20 text-[9px]">{item.email}</p>
        </div>
      ),
    },
    { key: 'courseName', header: 'Completed Course', sortable: true },
    {
      key: 'totalHours',
      header: 'Total Hours',
      sortable: true,
      render: (item) => (
        <span className="tabular-nums font-semibold text-white/60">{item.totalHours}h</span>
      ),
    },
    { key: 'completionDate', header: 'Completion Date', sortable: true },
    {
      key: 'certificateNumber',
      header: 'Certificate Number',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[10px] text-luxury-gold">{item.certificateNumber}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCertificate(item)}
            className="px-2.5 py-1 rounded-lg bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold/25 border border-luxury-gold/20 text-[10px] font-heading font-bold flex items-center gap-1 transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            View Cert
          </button>
          <button
            onClick={() => handleOpenCertificate(item)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-white/60 transition-all"
            title="Download Certificate"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={completedStudents}
        columns={columns}
        pageSize={10}
        searchable
        searchPlaceholder="Search completed students..."
        emptyMessage="No completed students yet"
        getRowKey={(item, index) => `${item.uid}_${item.courseId}_${index}`}
      />

      {/* Render Certificate Modal if open */}
      {selectedCert && (
        <CertificateGenerator
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
}
