'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingWizard } from '@/components/forms/onboarding-wizard';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    return { profile: null, hasProfile: false } as const;
  }
  return res.json();
};

export default function EditProfilePage() {
  const router = useRouter();
  const { data } = useSWR('/api/profile', fetcher);

  useEffect(() => {
    if (!data) return;
    if (!data.profile) {
      router.replace('/onboarding');
    }
  }, [data, router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-sand-100 py-10">
        <div className="mx-auto w-full max-w-4xl px-4 py-10">
          <Card>
            <CardContent className="space-y-6 p-8">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data.profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-sand-100 py-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <Card>
          <CardContent className="space-y-8 p-8">
            <OnboardingWizard profile={data.profile ?? undefined} mode="edit" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
