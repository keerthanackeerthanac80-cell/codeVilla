import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Flying AI Learning Villa — Premium AI Education Academy',
  description:
    'Enter the Flying AI Learning Villa — a luxury futuristic 3D campus floating above the clouds. Master Python, AI/ML, DevOps, Ethical Hacking, and more through an immersive cinematic learning experience.',
  keywords: [
    'AI courses',
    'machine learning',
    'python',
    'data science',
    'online learning',
    'flying villa',
    '3D education',
  ],
  openGraph: {
    title: 'Flying AI Learning Villa',
    description: 'Ultra-premium futuristic 3D AI education campus.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-deep-space text-white antialiased">
        {children}
      </body>
    </html>
  );
}
