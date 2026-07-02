'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  heavy?: boolean;
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'gold' | 'none';
  onClick?: () => void;
  as?: 'div' | 'section' | 'article' | 'aside';
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function GlassPanel({
  children,
  className,
  heavy = false,
  hover = false,
  glow = 'none',
  onClick,
  as: Component = 'div',
}: GlassPanelProps) {
  const glowClasses: Record<string, string> = {
    blue: 'glow-blue',
    purple: 'glow-purple',
    gold: 'glow-gold',
    none: '',
  };

  return (
    <Component
      className={cn(
        heavy ? 'glass-surface-heavy' : 'glass-surface',
        hover && 'glass-surface-hover cursor-pointer',
        'rounded-2xl transition-all duration-300',
        glowClasses[glow],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </Component>
  );
}
