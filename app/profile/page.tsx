import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUserProfile } from '@/lib/server/profile-actions';
import { ProfileSummary } from '@/components/profile/profile-summary';

async function ProfileContent() {
  const profile = await getCurrentUserProfile();
  const hasProfile = Boolean(profile);
  return (
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
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>
        <Suspense
          fallback={
            <p className="mt-6 text-sm text-slate-500">Loading profile…</p>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>
    </div>
  );
}

