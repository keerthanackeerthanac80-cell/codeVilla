'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Eye } from 'lucide-react';
import { loadCertificates, type CertificateData } from '@/utils/certificate';
import type { UserProgress } from '@/utils/progress';
import GlassPanel from '@/components/ui/GlassPanel';
import HologramText from '@/components/ui/HologramText';
import CertificateGenerator from './CertificateGenerator';

interface CertificateRoomProps {
  progress: UserProgress;
  userName: string;
}

export default function CertificateRoom({ progress, userName }: CertificateRoomProps) {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  useEffect(() => {
    if (!progress.userId) return;
    setCertificates(loadCertificates(progress.userId));
  }, [progress]);

  const completedCount = Object.values(progress.courses).filter((c) => c.completed).length;

  if (completedCount === 0) {
    return (
      <div className="px-4 pb-6">
        <GlassPanel className="p-6 text-center max-w-lg mx-auto">
          <div className="text-3xl mb-3">🏆</div>
          <HologramText as="h3" variant="gold" className="text-lg mb-2">
            Certificate Vault
          </HologramText>
          <p className="text-white/25 text-xs font-body">
            Complete courses to unlock certificates. Each certificate is unique and downloadable.
          </p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pb-6">
        <GlassPanel className="p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🏆</div>
            <HologramText as="h3" variant="gold" className="text-lg mb-1">
              Your Certificates
            </HologramText>
            <p className="text-white/25 text-xs font-body">
              {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassPanel
                  hover
                  className="p-4 flex items-center gap-3"
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-heading font-semibold truncate">
                      {cert.courseName}
                    </p>
                    <p className="text-white/25 text-[10px] font-body">
                      {cert.formattedDate} · {cert.id}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-white/20 flex-shrink-0" />
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {selectedCert && (
          <CertificateGenerator
            certificate={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
