import { Suspense } from 'react';
import { MatchesList } from '@/components/dashboard/matches-list';

export const dynamic = 'force-dynamic';

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Active mentorships
        </h1>
        <p className="text-sm text-slate-600">
          Manage and continue conversations with your mentors and mentees.
        </p>
        <Suspense
          fallback={
            <p className="mt-6 text-sm text-slate-500">Loading matches…</p>
          }
        >
          <MatchesList />
        </Suspense>
      </div>
    </div>
  );
}
