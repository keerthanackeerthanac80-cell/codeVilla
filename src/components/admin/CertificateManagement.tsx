'use client';

import { useEffect, useState } from 'react';
import { Download, Eye, Share2, RefreshCw, Award } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { getAllCertificates } from '@/lib/db-service';
import type { FirestoreCertificate } from '@/lib/firestore-types';

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState<FirestoreCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllCertificates()
      .then(setCertificates)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<FirestoreCertificate>[] = [
    {
      key: 'userName',
      header: 'Student',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-luxury-gold/60 flex-shrink-0" />
          <span className="text-white/70 font-heading font-semibold text-[11px]">
            {item.userName}
          </span>
        </div>
      ),
    },
    { key: 'courseName', header: 'Course', sortable: true },
    {
      key: 'formattedDate',
      header: 'Issued Date',
      sortable: true,
    },
    {
      key: 'serialNumber',
      header: 'Serial No.',
      render: (item) => (
        <span className="text-luxury-gold/50 text-[10px] font-mono">
          {item.serialNumber}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Certificate ID',
      render: (item) => (
        <span className="text-ai-blue/60 text-[10px] font-mono">{item.id}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '140px',
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-white/60 transition-all"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-white/60 transition-all"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-white/60 transition-all"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-white/60 transition-all"
            title="Reissue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Stats
  const totalCerts = certificates.length;
  const uniqueStudents = new Set(certificates.map((c) => c.userId)).size;
  const uniqueCourses = new Set(certificates.map((c) => c.courseId)).size;

  if (isLoading) {
    return (
      <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-heading font-bold text-luxury-gold/80">{totalCerts}</p>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">
            Total Certificates
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-heading font-bold text-ai-blue/80">{uniqueStudents}</p>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">
            Certified Students
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-heading font-bold text-cyber-purple/80">{uniqueCourses}</p>
          <p className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">
            Courses Certified
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={certificates}
        columns={columns}
        pageSize={15}
        searchable
        searchPlaceholder="Search certificates by name, course, ID..."
        emptyMessage="No certificates issued yet"
        getRowKey={(item) => item.id}
      />
    </div>
  );
}
