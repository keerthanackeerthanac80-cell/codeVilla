import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#050816',
        'deep-space-light': '#0a1128',
        'ai-blue': '#2563EB',
        'ai-blue-light': '#3B82F6',
        'ai-blue-dark': '#1D4ED8',
        'cyber-purple': '#7C3AED',
        'cyber-purple-light': '#8B5CF6',
        'cyber-purple-dark': '#6D28D9',
        'luxury-gold': '#F5C451',
        'luxury-gold-light': '#FBBF24',
        'luxury-gold-dark': '#D97706',
        'glass': 'rgba(255, 255, 255, 0.08)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'glass-hover': 'rgba(255, 255, 255, 0.14)',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'glow-pulse-fast': 'glow-pulse 1.5s ease-in-out infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'slide-in-right': 'slide-in-right 0.8s ease-out',
        'slide-in-left': 'slide-in-left 0.8s ease-out',
        'scale-reveal': 'scale-reveal 0.6s ease-out',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
        'door-open-left': 'door-open-left 2s ease-in-out forwards',
        'door-open-right': 'door-open-right 2s ease-in-out forwards',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'typewriter': 'typewriter 3s steps(30) 1s forwards',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        hologram: {
          '0%, 100%': { opacity: '0.8', transform: 'translateY(0px) scale(1)' },
          '50%': { opacity: '1', transform: 'translateY(-8px) scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-reveal': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'door-open-left': {
          '0%': { transform: 'perspective(1200px) rotateY(0deg)' },
          '100%': { transform: 'perspective(1200px) rotateY(-105deg)' },
        },
        'door-open-right': {
          '0%': { transform: 'perspective(1200px) rotateY(0deg)' },
          '100%': { transform: 'perspective(1200px) rotateY(105deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.5), 0 0 60px rgba(37, 99, 235, 0.2)',
        'glow-blue-lg': '0 0 40px rgba(37, 99, 235, 0.6), 0 0 100px rgba(37, 99, 235, 0.3)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.2)',
        'glow-purple-lg': '0 0 40px rgba(124, 58, 237, 0.6), 0 0 100px rgba(124, 58, 237, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 196, 81, 0.5), 0 0 60px rgba(245, 196, 81, 0.2)',
        'glow-gold-lg': '0 0 40px rgba(245, 196, 81, 0.6), 0 0 100px rgba(245, 196, 81, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-xl': '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
