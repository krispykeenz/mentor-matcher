import { Suspense } from 'react';
import { fetchDiscoveryProfiles } from '@/lib/server/repositories/profiles';
import { DiscoveryShell } from '@/components/discovery/shell';
import { requireAuth } from '@/lib/server/auth-guard';

export const dynamic = 'force-dynamic';

async function DiscoveryContent() {
  await requireAuth(); // Ensure user is authenticated
  const profiles = await fetchDiscoveryProfiles({});
  return <DiscoveryShell initialProfiles={profiles} />;
}

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:py-8">
        <Suspense fallback={<p>Loading profiles…</p>}>
          <DiscoveryContent />
        </Suspense>
      </div>
    </div>
  );
}
