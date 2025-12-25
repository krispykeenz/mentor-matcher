'use client';

import { SettingsPanel } from '@/components/dashboard/settings-panel';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Manage notifications, privacy, and account controls.
        </p>
        <SettingsPanel />
      </div>
    </div>
  );
}
