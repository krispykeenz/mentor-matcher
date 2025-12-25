'use client';

import { AdminReports } from '@/components/dashboard/admin-reports';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Console</h1>
        <p className="text-sm text-slate-600">
          Moderate reports, manage feature flags, and keep the community safe.
        </p>
        <AdminReports />
      </div>
    </div>
  );
}
