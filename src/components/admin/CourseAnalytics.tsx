'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import ChartWrapper, { CHART_COLORS, CHART_GRADIENT_DEFS } from '@/components/ui/ChartWrapper';
import { getCourseAnalytics, type CourseAnalyticsData } from '@/lib/analytics-service';

export default function CourseAnalytics() {
  const [courses, setCourses] = useState<CourseAnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCourseAnalytics()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  // Radar data
  const radarData = courses.map((c) => ({
    course: c.courseIcon,
    enrolled: c.totalEnrolled,
    completed: c.totalCompleted,
    progress: c.averageProgress,
  }));

  return (
    <div className="space-y-6">
      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {courses.map((course) => (
          <div
            key={course.courseId}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: `${course.courseColor}15`,
                  border: `1px solid ${course.courseColor}25`,
                }}
              >
                {course.courseIcon}
              </div>
              <div>
                <h4 className="text-white/70 text-xs font-heading font-bold">
                  {course.courseTitle}
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/25 uppercase tracking-wider">Enrolled</span>
                <span className="text-white/60 font-heading font-bold tabular-nums">
                  {course.totalEnrolled}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/25 uppercase tracking-wider">Completed</span>
                <span className="text-white/60 font-heading font-bold tabular-nums">
                  {course.totalCompleted}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/25 uppercase tracking-wider">Completion Rate</span>
                <span
                  className="font-heading font-bold tabular-nums"
                  style={{ color: course.courseColor }}
                >
                  {course.completionRate}%
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/25 uppercase tracking-wider">Avg Hours</span>
                <span className="text-white/60 font-heading font-bold tabular-nums">
                  {course.averageLearningHours}h
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${course.averageProgress}%`,
                    background: course.courseColor,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartWrapper title="Enrollment by Course" subtitle="Total students enrolled per course">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={courses} layout="vertical">
              {CHART_GRADIENT_DEFS}
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
              <XAxis
                type="number"
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="courseIcon"
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 14 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: CHART_COLORS.tooltip,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '11px',
                }}
                formatter={(value: any, name: any) => [value, name === 'totalEnrolled' ? 'Enrolled' : name]}
              />
              <Bar dataKey="totalEnrolled" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Completion Rate" subtitle="Percentage of enrolled students who completed">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={courses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="courseIcon"
                stroke={CHART_COLORS.axis}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 14 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: CHART_COLORS.tooltip,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [`${value}%`, 'Completion Rate']}
              />
              <Bar dataKey="completionRate" fill={CHART_COLORS.emerald} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
}
