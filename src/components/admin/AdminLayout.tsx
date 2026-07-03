'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  ClipboardList,
  UserCheck,
  Video,
} from 'lucide-react';
import type { VillaUser } from '@/utils/auth';
import HologramText from '@/components/ui/HologramText';
import AdminOverview from './AdminOverview';
import MembersTable from './MembersTable';
import CourseAnalytics from './CourseAnalytics';
import CertificateManagement from './CertificateManagement';
import VideoAnalytics from './VideoAnalytics';
import AdminNotifications from './AdminNotifications';
import StudentPerformance from './StudentPerformance';

type AdminSection =
  | 'overview'
  | 'members'
  | 'courses'
  | 'certificates'
  | 'video-analytics'
  | 'performance'
  | 'notifications'
  | 'settings';

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
  color: string;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: '#3B82F6' },
  { id: 'members', label: 'Members', icon: Users, color: '#8B5CF6' },
  { id: 'courses', label: 'Courses', icon: BookOpen, color: '#10B981' },
  { id: 'certificates', label: 'Certificates', icon: Award, color: '#F5C451' },
  { id: 'video-analytics', label: 'Video Analytics', icon: Video, color: '#06B6D4' },
  { id: 'performance', label: 'Performance', icon: UserCheck, color: '#EC4899' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: '#EF4444' },
];

interface AdminLayoutProps {
  user: VillaUser;
}

export default function AdminLayout({ user }: AdminLayoutProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'members':
        return <MembersTable />;
      case 'courses':
        return <CourseAnalytics />;
      case 'certificates':
        return <CertificateManagement />;
      case 'video-analytics':
        return <VideoAnalytics />;
      case 'performance':
        return <StudentPerformance />;
      case 'notifications':
        return <AdminNotifications />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="fixed inset-0 bg-deep-space flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex-shrink-0 h-full border-r border-white/[0.06] bg-white/[0.01] flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ai-blue to-cyber-purple flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="font-heading font-bold text-sm text-white/80">
                Villa Admin
              </h1>
              <p className="text-white/20 text-[9px] font-body">Analytics Dashboard</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-lg'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? item.color : undefined }}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: item.color }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle + User */}
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/20 hover:text-white/40 hover:bg-white/[0.03] text-xs transition-all"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ai-blue to-cyber-purple flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {user.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-[11px] font-heading font-semibold truncate">
                  {user.displayName}
                </p>
                <p className="text-white/15 text-[9px] font-body truncate">
                  Administrator
                </p>
              </div>
            </div>
          )}

          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/5 text-xs transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Back to Villa</span>}
          </a>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-villa">
        <div className="p-6 md:p-8 max-w-[1400px]">
          {/* Section Header */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <HologramText as="h1" className="text-2xl md:text-3xl mb-1">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label || 'Dashboard'}
            </HologramText>
            <p className="text-white/20 text-xs font-body">
              Flying AI Learning Villa — Admin Analytics
            </p>
          </motion.div>

          {/* Section Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
