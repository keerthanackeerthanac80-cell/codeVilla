'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getSession, isAdmin } from '@/utils/auth';
import type { VillaUser } from '@/utils/auth';
import HologramText from '@/components/ui/HologramText';

// Dynamic imports for admin components
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'), { ssr: false });

export default function AdminPage() {
  const [user, setUser] = useState<VillaUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = getSession();
      if (!session) {
        setIsChecking(false);
        return;
      }
      setUser(session);
      const adminStatus = await isAdmin(session.id);
      setIsAuthorized(adminStatus);
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  // Loading state
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-deep-space flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-2 border-ai-blue/30 border-t-ai-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-xs font-body">Verifying admin access...</p>
        </motion.div>
      </div>
    );
  }

  // Not authorized
  if (!user || !isAuthorized) {
    return (
      <div className="fixed inset-0 bg-deep-space flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-5xl mb-4">🔒</div>
          <HologramText as="h1" className="text-2xl mb-3">
            Admin Access Required
          </HologramText>
          <p className="text-white/30 text-sm font-body mb-6">
            You don&apos;t have permission to access the admin dashboard.
            Please contact the system administrator to request admin access.
          </p>
          <a
            href="/"
            className="btn-premium px-6 py-3 text-white text-sm inline-flex items-center gap-2"
          >
            ← Return to Villa
          </a>
        </motion.div>
      </div>
    );
  }

  return <AdminLayout user={user} />;
}
