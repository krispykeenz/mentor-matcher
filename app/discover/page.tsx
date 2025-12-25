'use client';

import { useEffect, useState } from 'react';
import { DiscoveryShell } from '@/components/discovery/shell';
import type { DiscoveryProfile } from '@/components/discovery/profile-card';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoveryProfile[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/discovery');
        if (!res.ok) {
          if (!cancelled) setProfiles([]);
          return;
        }
        const data = (await res.json()) as { profiles?: DiscoveryProfile[] };
        if (!cancelled) setProfiles(data.profiles ?? []);
      } catch {
        if (!cancelled) setProfiles([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:py-8">
        {profiles === null ? (
          <p>Loading profiles…</p>
        ) : (
          <DiscoveryShell initialProfiles={profiles} />
        )}
      </div>
    </div>
  );
}
