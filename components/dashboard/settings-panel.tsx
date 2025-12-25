'use client';

import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load settings');
  }
  return res.json();
};

export function SettingsPanel() {
  const { data } = useSWR('/api/profile', fetcher);
  const profile = data?.profile as any | null | undefined;

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Push notifications
            </h2>
            <p className="text-sm text-slate-500">
              Receive updates when you get a new request or message.
            </p>
          </div>
          <Switch defaultChecked={profile?.notifications?.push ?? true} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Email summaries
            </h2>
            <p className="text-sm text-slate-500">
              Send me a weekly summary of mentorship activity.
            </p>
          </div>
          <Switch defaultChecked={profile?.notifications?.email ?? true} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Account controls
          </h2>
          <p className="text-sm text-slate-500">
            You can request account deletion by emailing
            privacy@mentormatchsa.org. We will remove personal data within 14
            days.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
