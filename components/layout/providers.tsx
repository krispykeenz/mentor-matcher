'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth/auth-context';
import { installDemoApiFetch } from '@/lib/demo/demo-api';
import { isDemoMode } from '@/lib/demo/demo-mode';
import { AnalyticsProvider } from '@/lib/utils/analytics';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (isDemoMode) {
      installDemoApiFetch();
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AnalyticsProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
