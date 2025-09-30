'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      persistence: 'localStorage+cookie',
    });

    return () => {
      posthog.stopSessionRecording();
    };
  }, []);

  return <>{children}</>;
}
