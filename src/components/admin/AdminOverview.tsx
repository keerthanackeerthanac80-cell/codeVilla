'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Award,
  BookOpen,
  Video,
  Clock,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import ChartWrapper, { CHART_COLORS, CHART_GRADIENT_DEFS } from '@/components/ui/ChartWrapper';
import ActivityFeed from '@/components/ui/ActivityFeed';
import { getOverviewStats, getRegistrationTrends, getCourseAnalytics, type CourseAnalyticsData } from '@/lib/analytics-service';
import type { OverviewStats, LearningTimeData } from '@/lib/firestore-types';

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [regTrends, setRegTrends] = useState<LearningTimeData[]>([]);
  const [courseData, setCourseData] = useState<CourseAnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, r, c] = await Promise.all([
          getOverviewStats(),
          getRegistrationTrends('daily', 14),
          getCourseAnalytics(),
        ]);
        setStats(s);
        setRegTrends(r);
        setCourseData(c);
      } catch (err) {
        console.error('Failed to fetch overview stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pie chart data for course completion
  const pieData = courseData.map((c) => ({
    name: c.courseTitle,
    value: c.totalEnrolled || 1,
    color: c.courseColor,
  }));

  const STAT_CARDS = stats
    ? [
        { label: 'Registered Members', value: stats.registeredMembers, icon: Users, color: '#3B82F6' },
        { label: 'Active Members', value: stats.activeMembers, icon: UserCheck, color: '#10B981' },
        { label: 'Inactive Members', value: stats.inactiveMembers, icon: UserX, color: '#EF4444' },
        { label: 'Completed Students', value: stats.completedStudents, icon: GraduationCap, color: '#F5C451' },
        { label: 'Pending Students', value: stats.pendingStudents, icon: Clock, color: '#F59E0B' },
        { label: 'Certificates Issued', value: stats.certificatesIssued, icon: Award, color: '#8B5CF6' },
        { label: 'Courses Available', value: stats.coursesAvailable, icon: BookOpen, color: '#06B6D4' },
        { label: 'Videos Watched Today', value: stats.videosWatchedToday, icon: Video, color: '#EC4899' },
        { label: 'Avg Learning Hours', value: stats.averageLearningHours, icon: TrendingUp, color: '#6366F1', suffix: 'h' },
        { label: "Today's Registrations", value: stats.todaysRegistrations, icon: Zap, color: '#10B981' },
        { label: 'Monthly Registrations', value: stats.monthlyRegistrations, icon: Calendar, color: '#3B82F6' },
        { label: 'Weekly Active', value: stats.weeklyActivity, icon: Activity, color: '#8B5CF6' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {isLoading
          ? [...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse"
              />
            ))
          : STAT_CARDS.map((card, i) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                suffix={card.suffix}
                delay={i * 80}
              />
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Registration Trend */}
        <ChartWrapper
          title="Registration Trend"
          subtitle="Last 14 days"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={regTrends}>
              {CHART_GRADIENT_DEFS}
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="label"
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: CHART_COLORS.tooltip,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                name="Registrations"
                stroke={CHART_COLORS.blue}
                strokeWidth={2}
                fill="url(#chartGradientBlue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Course Enrollment Pie */}
        <ChartWrapper title="Course Enrollment" subtitle="Distribution by course">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: CHART_COLORS.tooltip,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-heading font-bold text-white/60 mb-1">
            Real-Time Activity
          </h3>
          <p className="text-white/20 text-[10px] font-body mb-4">
            Live updates from students
          </p>
          <ActivityFeed maxItems={10} />
        </div>

        {/* Course Performance Cards */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-heading font-bold text-white/60 mb-1">
            Course Performance
          </h3>
          <p className="text-white/20 text-[10px] font-body mb-4">
            Completion rates by course
          </p>
          <div className="space-y-2.5">
            {courseData.map((course) => (
              <div key={course.courseId} className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{course.courseIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/40 text-[11px] font-heading font-semibold truncate">
                      {course.courseTitle}
                    </span>
                    <span className="text-white/25 text-[10px] font-heading tabular-nums ml-2">
                      {course.completionRate}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${course.completionRate}%`,
                        background: course.courseColor,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white/25 text-[9px] font-body">
                    {course.totalCompleted}/{course.totalEnrolled}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
