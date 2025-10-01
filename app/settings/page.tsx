import { Suspense } from 'react';
import { SettingsPanel } from '@/components/dashboard/settings-panel';
import { requireAuth } from '@/lib/server/auth-guard';

export default async function SettingsPage() {
  await requireAuth(); // Ensure user is authenticated
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Manage notifications, privacy, and account controls.
        </p>
        <Suspense
          fallback={
            <p className="mt-6 text-sm text-slate-500">Loading settings…</p>
          }
        >
          <SettingsPanel />
        </Suspense>
      </div>
    </div>
  );
}
