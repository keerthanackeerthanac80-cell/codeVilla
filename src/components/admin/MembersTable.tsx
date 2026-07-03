'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, BookOpen, Award, Clock, MoreVertical } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { getAllUsers } from '@/lib/db-service';
import { getAllCourseProgress } from '@/lib/db-service';
import type { FirestoreUser, FirestoreCourseProgress } from '@/lib/firestore-types';
import { COURSES } from '@/utils/courses';
import PendingStudentsTable from './PendingStudentsTable';
import CompletedStudentsTable from './CompletedStudentsTable';


interface MemberRow {
  uid: string;
  displayName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  currentDegree: string;
  collegeOrCompany: string;
  currentCourse: string;
  registrationDate: string;
  learningHours: number;
  completedPct: number;
  videosCompleted: number;
  pendingVideos: number;
  certificateStatus: string;
  accountStatus: string;
  lastLogin: string;
  avatarInitials: string;
}

export default function MembersTable() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, progress] = await Promise.all([
          getAllUsers(),
          getAllCourseProgress(),
        ]);

        const rows: MemberRow[] = users
          .filter((u) => u.role !== 'admin')
          .map((u) => {
            const userProgress = progress.filter((p) => p.userId === u.uid);
            const completedCourses = userProgress.filter((p) => p.completed).length;
            const startedCourses = userProgress.filter((p) => p.started).length;
            const totalHours = userProgress.reduce(
              (sum, p) => sum + (p.totalWatchTimeSeconds || 0),
              0
            ) / 3600;
            const avgProgress = startedCourses > 0
              ? userProgress.reduce((sum, p) => sum + p.watchProgress, 0) / startedCourses
              : 0;

            // Current course = most recently updated
            const sortedProgress = [...userProgress].sort(
              (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')
            );
            const currentCourseId = sortedProgress.find((p) => p.started && !p.completed)?.courseId;
            const currentCourse = currentCourseId
              ? COURSES.find((c) => c.id === currentCourseId)?.shortTitle || '—'
              : completedCourses > 0
              ? 'All Completed'
              : '—';

            return {
              uid: u.uid,
              displayName: u.fullName || u.displayName,
              email: u.email,
              gender: u.gender || '—',
              phoneNumber: u.phoneNumber || '—',
              currentDegree: u.currentDegree || '—',
              collegeOrCompany: u.collegeOrCompany || '—',
              currentCourse,
              registrationDate: new Date(u.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
              learningHours: Math.round(totalHours * 10) / 10,
              completedPct: Math.round(avgProgress),
              videosCompleted: completedCourses,
              pendingVideos: COURSES.length - completedCourses,
              certificateStatus: completedCourses > 0 ? `${completedCourses} Earned` : 'None',
              accountStatus: u.accountStatus || 'active',
              lastLogin: new Date(u.lastLogin).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              avatarInitials: u.avatarInitials,
            };
          });

        setMembers(rows);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter by tab
  const filteredMembers = members.filter((m) => {
    if (activeTab === 'pending') return m.videosCompleted < COURSES.length && m.completedPct > 0;
    if (activeTab === 'completed') return m.videosCompleted >= COURSES.length;
    return true;
  });

  const columns: Column<MemberRow>[] = [
    {
      key: 'displayName',
      header: 'Student',
      sortable: true,
      width: '200px',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ai-blue to-cyber-purple flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {item.avatarInitials}
          </div>
          <div>
            <p className="text-white/70 font-heading font-semibold text-[11px]">
              {item.displayName}
            </p>
            <p className="text-white/20 text-[9px]">{item.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'gender', header: 'Gender', sortable: true, width: '80px' },
    { key: 'phoneNumber', header: 'Phone', width: '120px' },
    { key: 'currentDegree', header: 'Degree', sortable: true, width: '100px' },
    { key: 'collegeOrCompany', header: 'College', sortable: true, width: '140px' },
    { key: 'currentCourse', header: 'Current Course', sortable: true, width: '120px' },
    { key: 'registrationDate', header: 'Registered', sortable: true, width: '110px' },
    {
      key: 'learningHours',
      header: 'Hours',
      sortable: true,
      width: '70px',
      render: (item) => (
        <span className="tabular-nums">{item.learningHours}h</span>
      ),
    },
    {
      key: 'completedPct',
      header: 'Progress',
      sortable: true,
      width: '100px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${item.completedPct}%`,
                background:
                  item.completedPct >= 100
                    ? 'linear-gradient(90deg, #F5C451, #D97706)'
                    : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
              }}
            />
          </div>
          <span className="text-[10px] tabular-nums w-7 text-right">
            {item.completedPct}%
          </span>
        </div>
      ),
    },
    {
      key: 'certificateStatus',
      header: 'Certificates',
      width: '100px',
      render: (item) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-md ${
            item.certificateStatus !== 'None'
              ? 'bg-luxury-gold/10 text-luxury-gold/80'
              : 'bg-white/[0.03] text-white/20'
          }`}
        >
          {item.certificateStatus}
        </span>
      ),
    },
    {
      key: 'accountStatus',
      header: 'Status',
      sortable: true,
      width: '80px',
      render: (item) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-md ${
            item.accountStatus === 'active'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {item.accountStatus}
        </span>
      ),
    },
    { key: 'lastLogin', header: 'Last Login', sortable: true, width: '120px' },
  ];

  const TABS = [
    { id: 'all' as const, label: 'All Members', count: members.length },
    {
      id: 'pending' as const,
      label: 'Pending',
      count: members.filter((m) => m.videosCompleted < COURSES.length && m.completedPct > 0).length,
    },
    {
      id: 'completed' as const,
      label: 'Completed',
      count: members.filter((m) => m.videosCompleted >= COURSES.length).length,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] opacity-50">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {activeTab === 'all' && (
        <DataTable
          data={filteredMembers}
          columns={columns}
          pageSize={15}
          searchable
          searchPlaceholder="Search by name, email, phone, degree..."
          emptyMessage="No members found"
          getRowKey={(item) => item.uid}
        />
      )}
      {activeTab === 'pending' && <PendingStudentsTable />}
      {activeTab === 'completed' && <CompletedStudentsTable />}
    </div>
  );
}
