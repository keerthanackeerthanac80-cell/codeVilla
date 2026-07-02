'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Award } from 'lucide-react';
import type { CertificateData } from '@/utils/certificate';

interface CertificateGeneratorProps {
  certificate: CertificateData;
  onClose: () => void;
}

export default function CertificateGenerator({
  certificate,
  onClose,
}: CertificateGeneratorProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#050816',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `certificate-${certificate.courseName.replace(/\s+/g, '-').toLowerCase()}-${certificate.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    }
  }, [certificate]);

  const handleDownloadPDF = useCallback(async () => {
    if (!certRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#050816',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`certificate-${certificate.courseName.replace(/\s+/g, '-').toLowerCase()}-${certificate.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  }, [certificate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          aria-label="Close certificate"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Preview */}
        <div
          ref={certRef}
          className="certificate-bg rounded-2xl overflow-hidden"
          style={{
            aspectRatio: '16 / 9.5',
          }}
        >
          <div className="relative w-full h-full p-8 md:p-12 flex flex-col items-center justify-center text-center">
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-luxury-gold/40 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-luxury-gold/40 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-luxury-gold/40 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-luxury-gold/40 rounded-br-lg" />

            {/* Top decorative line */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />

            {/* Logo */}
            <div className="text-4xl md:text-5xl mb-3">🏛️</div>

            {/* Academy name */}
            <p
              className="text-luxury-gold/60 text-[10px] md:text-xs tracking-[0.4em] uppercase font-body mb-6"
              style={{ textShadow: '0 0 10px rgba(245, 196, 81, 0.3)' }}
            >
              Flying AI Learning Villa Academy
            </p>

            {/* Certificate of */}
            <h2
              className="text-white/80 text-base md:text-lg font-body tracking-[0.2em] uppercase mb-2"
            >
              Certificate of Completion
            </h2>

            {/* Decorative line */}
            <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent mb-6" />

            {/* Recipient text */}
            <p className="text-white/40 text-xs md:text-sm font-body mb-2">
              This certifies that
            </p>

            {/* User Name */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #F5C451 0%, #FBBF24 50%, #D97706 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 20px rgba(245, 196, 81, 0.3))',
              }}
            >
              {certificate.userName}
            </h1>

            {/* Has completed */}
            <p className="text-white/40 text-xs md:text-sm font-body mb-2">
              has successfully completed the course
            </p>

            {/* Course Name */}
            <h3
              className="text-xl md:text-2xl font-heading font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #7C3AED 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 15px rgba(37, 99, 235, 0.3))',
              }}
            >
              {certificate.courseName}
            </h3>

            {/* Bottom info */}
            <div className="flex items-center gap-8 md:gap-12 text-center">
              <div>
                <p className="text-white/20 text-[9px] md:text-[10px] uppercase tracking-wider font-body mb-1">
                  Date Issued
                </p>
                <p className="text-white/50 text-xs md:text-sm font-heading font-semibold">
                  {certificate.formattedDate}
                </p>
              </div>
              <div>
                <p className="text-white/20 text-[9px] md:text-[10px] uppercase tracking-wider font-body mb-1">
                  Certificate ID
                </p>
                <p className="text-luxury-gold/60 text-xs md:text-sm font-heading font-semibold tracking-wider">
                  {certificate.id}
                </p>
              </div>
            </div>

            {/* Bottom decorative line */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            className="btn-gold px-6 py-3 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPNG}
            className="btn-premium px-6 py-3 text-white text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
