'use client';

import { useEffect, useState } from 'react';
import { Mail, Clock, Calendar, AlertCircle } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { getAllUsers, getAllCourseProgress, createNotification, logActivity } from '@/lib/db-service';
import type { FirestoreUser, FirestoreCourseProgress } from '@/lib/firestore-types';
import { COURSES } from '@/utils/courses';

interface PendingStudentRow {
  uid: string;
  studentName: string;
  email: string;
  courseId: string;
  courseName: string;
  pendingVideos: number;
  learningHours: number;
  remainingPct: number;
  lastActivity: string;
  expectedCompletionDate: string;
}

export default function PendingStudentsTable() {
  const [pendingStudents, setPendingStudents] = useState<PendingStudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, progress] = await Promise.all([
          getAllUsers(),
          getAllCourseProgress(),
        ]);

        const rows: PendingStudentRow[] = [];

        users
          .filter((u) => u.role !== 'admin')
          .forEach((u) => {
            const userProgress = progress.filter((p) => p.userId === u.uid);
            
            userProgress.forEach((p) => {
              // Only include courses that are started but NOT completed
              if (p.started && !p.completed) {
                const course = COURSES.find((c) => c.id === p.courseId);
                if (!course) return;

                const completedVideosCount = p.completed ? course.topics.length : Math.floor((p.watchProgress / 100) * course.topics.length);
                const pendingVideos = Math.max(0, course.topics.length - completedVideosCount);
                const learningHours = Math.round((p.totalWatchTimeSeconds || 0) / 3600 * 10) / 10;
                const remainingPct = Math.round(100 - p.watchProgress);
                
                // Calculate expected completion date
                // Average pace = learningHours / watchProgress % per hour
                // Remaining hours needed = (remainingPct * (10 / 100)) or similar. Let's make a realistic projection.
                let expectedCompletionStr = 'N/A';
                if (p.watchProgress > 0 && learningHours > 0) {
                  const hoursPerPercent = learningHours / p.watchProgress;
                  const remainingHours = remainingPct * hoursPerPercent;
                  const completionDate = new Date(Date.now() + remainingHours * 3600 * 1000);
                  expectedCompletionStr = completionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                } else {
                  // Fallback: 7 days from now
                  const completionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  expectedCompletionStr = completionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                }

                rows.push({
                  uid: u.uid,
                  studentName: u.fullName || u.displayName,
                  email: u.email,
                  courseId: p.courseId,
                  courseName: course.title,
                  pendingVideos,
                  learningHours,
                  remainingPct,
                  lastActivity: new Date(p.updatedAt || p.startedAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  expectedCompletionDate: expectedCompletionStr,
                });
              }
            });
          });

        setPendingStudents(rows);
      } catch (err) {
        console.error('Failed to fetch pending students:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendReminder = async (student: PendingStudentRow) => {
    const key = `${student.uid}_${student.courseId}`;
    setSendingReminderId(key);
    try {
      await createNotification(
        'low_activity',
        'Course Progress Reminder',
        `Hi ${student.studentName}, you have ${student.pendingVideos} videos remaining in ${student.courseName}. Keep studying!`,
        {
          userId: student.uid,
          userName: student.studentName,
          courseId: student.courseId,
          courseName: student.courseName,
        }
      );
      await logActivity(
        student.uid,
        student.studentName,
        'profile_updated',
        `Admin sent course completion reminder to ${student.studentName} for ${student.courseName}`
      );
      setReminderStatus((prev) => ({ ...prev, [key]: 'Sent!' }));
      setTimeout(() => {
        setReminderStatus((prev) => ({ ...prev, [key]: '' }));
      }, 3000);
    } catch (err) {
      console.error('Failed to send reminder:', err);
      setReminderStatus((prev) => ({ ...prev, [key]: 'Failed' }));
    } finally {
      setSendingReminderId(null);
    }
  };

  const columns: Column<PendingStudentRow>[] = [
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
    { key: 'courseName', header: 'Course Name', sortable: true },
    {
      key: 'pendingVideos',
      header: 'Pending Videos',
      sortable: true,
      render: (item) => (
        <span className="tabular-nums font-semibold text-luxury-gold">{item.pendingVideos}</span>
      ),
    },
    {
      key: 'learningHours',
      header: 'Learning Hours',
      sortable: true,
      render: (item) => (
        <span className="tabular-nums text-white/50">{item.learningHours}h</span>
      ),
    },
    {
      key: 'remainingPct',
      header: 'Remaining %',
      sortable: true,
      render: (item) => (
        <span className="tabular-nums font-semibold text-cyber-purple-light">{item.remainingPct}%</span>
      ),
    },
    { key: 'lastActivity', header: 'Last Activity', sortable: true },
    {
      key: 'expectedCompletionDate',
      header: 'Expected Completion Date',
      sortable: true,
      render: (item) => (
        <span className="text-emerald-400 font-semibold">{item.expectedCompletionDate}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const key = `${item.uid}_${item.courseId}`;
        const isSent = reminderStatus[key] === 'Sent!';
        return (
          <button
            onClick={() => handleSendReminder(item)}
            disabled={sendingReminderId === key}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-heading font-bold transition-all ${
              isSent
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold/25 border border-luxury-gold/20'
            }`}
          >
            {sendingReminderId === key ? 'Sending...' : isSent ? 'Sent ✓' : 'Send Reminder'}
          </button>
        );
      },
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
        data={pendingStudents}
        columns={columns}
        pageSize={10}
        searchable
        searchPlaceholder="Search pending students..."
        emptyMessage="No pending students at the moment"
        getRowKey={(item, index) => `${item.uid}_${item.courseId}_${index}`}
      />
    </div>
  );
}
