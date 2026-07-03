'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToActivities } from '@/lib/db-service';
import type { FirestoreActivityLog, ActivityType } from '@/lib/firestore-types';

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  enrolled: '📚',
  completed_course: '🎉',
  watched_video: '▶️',
  downloaded_certificate: '📜',
  logged_in: '🔑',
  registered: '🆕',
  profile_updated: '✏️',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  enrolled: '#3B82F6',
  completed_course: '#10B981',
  watched_video: '#8B5CF6',
  downloaded_certificate: '#F5C451',
  logged_in: '#06B6D4',
  registered: '#EC4899',
  profile_updated: '#6366F1',
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

interface ActivityFeedProps {
  maxItems?: number;
  className?: string;
}

export default function ActivityFeed({
  maxItems = 15,
  className = '',
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<FirestoreActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActivities((newActivities) => {
      setActivities(newActivities.slice(0, maxItems));
      setIsLoading(false);
    }, maxItems);

    // If no Firebase, stop loading after a delay
    const timeout = setTimeout(() => setIsLoading(false), 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [maxItems]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] animate-pulse"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-white/5" />
              <div className="h-2 w-1/3 rounded bg-white/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className={`flex items-center justify-center py-12 text-white/20 text-xs font-body ${className}`}
      >
        <div className="text-center">
          <p className="text-2xl mb-2">📊</p>
          <p>No recent activity</p>
          <p className="text-white/10 mt-1">Activity will appear here in real-time</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <AnimatePresence mode="popLayout">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id || i}
            initial={{ opacity: 0, x: -10, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 10, height: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group"
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: `${ACTIVITY_COLORS[activity.type] || '#3B82F6'}12`,
                border: `1px solid ${ACTIVITY_COLORS[activity.type] || '#3B82F6'}20`,
              }}
            >
              {ACTIVITY_ICONS[activity.type] || '📋'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white/50 text-xs font-body truncate">
                {activity.description}
              </p>
              <p className="text-white/15 text-[10px] font-body">
                {timeAgo(activity.createdAt)}
              </p>
            </div>

            {/* Live dot for recent activities */}
            {new Date().getTime() - new Date(activity.createdAt).getTime() <
              300000 && (
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
