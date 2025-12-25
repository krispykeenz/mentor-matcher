'use client';

import useSWR from 'swr';
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

export default function OnboardingPage() {
  const { data } = useSWR('/api/profile', fetcher);
  const profile = (data as any)?.profile ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-sand-100 py-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="relative mb-6 hidden h-44 overflow-hidden rounded-3xl md:block">
          <img
            src="https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1200&auto=format&fit=crop"
            alt="Calming workspace"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-white/30 to-transparent" />
        </div>

        {!data ? (
          <Card>
            <CardContent className="space-y-6 p-8">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-float-in">
            <CardContent className="space-y-8 p-8">
              <OnboardingWizard profile={profile ?? undefined} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
