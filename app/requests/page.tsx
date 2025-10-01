import { Suspense } from 'react';
import { RequestLists } from '@/components/dashboard/request-lists';
import { requireAuth } from '@/lib/server/auth-guard';

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  await requireAuth(); // Ensure user is authenticated
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Mentorship requests
        </h1>
        <p className="text-sm text-slate-600">
          Review requests you have sent and received.
        </p>
        <Suspense
          fallback={
            <p className="mt-6 text-sm text-slate-500">Loading requests…</p>
          }
        >
          <RequestLists />
        </Suspense>
      </div>
    </div>
  );
}
