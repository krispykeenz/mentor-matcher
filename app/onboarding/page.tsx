import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingWizard } from '@/components/forms/onboarding-wizard';
import { getCurrentUserProfile } from '@/lib/server/profile-actions';
import { Skeleton } from '@/components/ui/skeleton';

async function OnboardingContent() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Card>
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
