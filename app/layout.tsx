import type { Metadata } from 'next';
import './globals.css';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/layout/providers';

export const metadata: Metadata = {
  title: 'MentorMatch SA',
  description:
    'Mobile-first mentorship matching for South African community service health professionals.',
  manifest: '/manifest.webmanifest',
  icons: [
    { rel: 'icon', url: '/icons/icon-192x192.svg', type: 'image/svg+xml' },
    {
      rel: 'apple-touch-icon',
      url: '/icons/icon-192x192.svg',
      type: 'image/svg+xml',
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-sand-50 font-sans text-slate-900">
        <Providers>
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
