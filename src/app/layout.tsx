import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ConsciousnessNavigation from '@/components/navigation/ConsciousnessNavigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WitnessOS - Consciousness Exploration Platform',
  description: 'Sacred digital space for consciousness exploration, featuring protected temples, workshops, and engine laboratories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          
          {/* Unified Admin Navigation - Only shows for admin users after loading */}
          <ConsciousnessNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
