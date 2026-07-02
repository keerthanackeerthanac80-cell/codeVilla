'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface HologramTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gold';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export default function HologramText({
  children,
  className,
  variant = 'default',
  as: Component = 'span',
}: HologramTextProps) {
  return (
    <Component
      className={clsx(
        'font-heading font-bold',
        variant === 'default' ? 'hologram-text' : 'hologram-text-gold',
        className
      )}
    >
      {children}
    </Component>
  );
}
