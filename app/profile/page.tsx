'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileSummary } from '@/components/profile/profile-summary';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    return { profile: null, hasProfile: false } as const;
  }
  return res.json();
};

export default function ProfilePage() {
  const { data } = useSWR('/api/profile', fetcher);

  const profile = (data as any)?.profile ?? null;
  const hasProfile = Boolean((data as any)?.hasProfile);

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>
        {!data ? (
          <p className="mt-6 text-sm text-slate-500">Loading profile…</p>
        ) : (
          <Card>
            <CardContent className="space-y-6 p-8">
              <ProfileSummary profile={profile} />
              <div className="flex justify-end">
                {hasProfile ? (
                  <Button asChild variant="outline">
                    <Link href="/profile/edit">Edit profile</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/onboarding">Start onboarding</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
