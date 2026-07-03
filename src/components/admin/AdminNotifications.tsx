'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Check, Clock, UserPlus, Award, AlertTriangle } from 'lucide-react';
import { getAdminNotifications, markNotificationRead } from '@/lib/db-service';
import type { FirestoreNotification, NotificationType } from '@/lib/firestore-types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  new_registration: <UserPlus className="w-4 h-4" />,
  course_completion: <Award className="w-4 h-4" />,
  certificate_generated: <Award className="w-4 h-4" />,
  inactive_student: <AlertTriangle className="w-4 h-4" />,
  low_activity: <Clock className="w-4 h-4" />,
  support_request: <Bell className="w-4 h-4" />,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  new_registration: '#EC4899',
  course_completion: '#10B981',
  certificate_generated: '#F5C451',
  inactive_student: '#EF4444',
  low_activity: '#F59E0B',
  support_request: '#3B82F6',
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    getAdminNotifications(100)
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    if (!id) return;
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
            filter === 'all'
              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
              : 'text-white/30 hover:text-white/50 border border-transparent'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
              : 'text-white/30 hover:text-white/50 border border-transparent'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="w-8 h-8 text-white/10 mb-3" />
          <p className="text-white/25 text-sm font-body">No notifications</p>
          <p className="text-white/10 text-xs font-body mt-1">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredNotifications.map((notif, i) => (
            <motion.div
              key={notif.id || i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                notif.read
                  ? 'bg-white/[0.01] border-white/[0.03]'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: `${NOTIFICATION_COLORS[notif.type]}15`,
                  color: NOTIFICATION_COLORS[notif.type],
                  border: `1px solid ${NOTIFICATION_COLORS[notif.type]}20`,
                }}
              >
                {NOTIFICATION_ICONS[notif.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-heading font-semibold ${
                    notif.read ? 'text-white/35' : 'text-white/70'
                  }`}
                >
                  {notif.title}
                </p>
                <p
                  className={`text-[11px] font-body mt-0.5 ${
                    notif.read ? 'text-white/15' : 'text-white/30'
                  }`}
                >
                  {notif.message}
                </p>
                <p className="text-white/10 text-[9px] font-body mt-1">
                  {timeAgo(notif.createdAt)}
                </p>
              </div>

              {/* Mark Read */}
              {!notif.read && notif.id && (
                <button
                  onClick={() => handleMarkRead(notif.id!)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/15 hover:text-emerald-400 transition-all flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Unread dot */}
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-ai-blue animate-pulse flex-shrink-0 mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
