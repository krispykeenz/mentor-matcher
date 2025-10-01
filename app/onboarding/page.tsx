import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingWizard } from '@/components/forms/onboarding-wizard';
import { getCurrentUserProfile } from '@/lib/server/profile-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function OnboardingContent() {
  // Check if user is authenticated
  const sessionCookie = cookies().get('__session');
  if (!sessionCookie) {
    redirect('/signin');
  }
  
  const profile = await getCurrentUserProfile();
  
  // Double-check profile fetch worked (in case session is invalid)
  if (profile === null) {
    redirect('/signin');
  }

  return (
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
      <Card className="animate-float-in">
        <CardContent className="space-y-8 p-8">
          <OnboardingWizard profile={profile ?? undefined} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-sand-100 py-10">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-4xl px-4 py-10">
            <Card>
              <CardContent className="space-y-6 p-8">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        }
      >
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
