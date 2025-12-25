'use client';

import { RequestLists } from '@/components/dashboard/request-lists';

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Mentorship requests
        </h1>
        <p className="text-sm text-slate-600">
          Review requests you have sent and received.
        </p>
        <RequestLists />
      </div>
    </div>
  );
}
