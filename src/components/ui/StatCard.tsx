'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: string; // hex color for accent
  suffix?: string;
  prefix?: string;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = '#3B82F6',
  suffix = '',
  prefix = '',
  trend,
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  // Animated counter
  useEffect(() => {
    if (hasAnimated.current) {
      setDisplayValue(value);
      return;
    }
    hasAnimated.current = true;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-all duration-300 group"
    >
      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{ background: color }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}20`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-heading font-bold text-white/90 tabular-nums">
          {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
        {trend && (
          <span
            className={`text-[10px] font-heading font-bold ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-white/30 text-[10px] uppercase tracking-wider font-heading font-bold">
        {label}
      </p>
    </motion.div>
  );
}
