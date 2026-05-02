import type { Metadata } from 'next';
import './globals.css';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Bouut Music — Distribute, Promote & Monetize Your Music',
  description: 'The ultimate platform for independent artists. Distribute your music to 150+ platforms, promote your tracks, and grow your fanbase.',
  icons: {
    icon: '/logo-light.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-light.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
