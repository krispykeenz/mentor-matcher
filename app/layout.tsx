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
          <main className="pb-20 md:pb-0 md:pt-16">{children}</main>
          {/* Mobile primary navigation */}
          {/* @ts-expect-error Server-to-client import is allowed for client components */}
          <MobileNavSlot />
          {/* Desktop top navigation */}
          {/* @ts-expect-error Server-to-client import is allowed for client components */}
          <TopNavSlot />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

// Separate component to avoid Next.js RSC hoisting surprises
function MobileNavSlot() {
  // Dynamically import to ensure client-only behavior without SSR issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { BottomNav } = require('@/components/layout/bottom-nav');
  return <BottomNav />;
}

function TopNavSlot() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TopNav } = require('@/components/layout/top-nav');
  return <TopNav />;
}
