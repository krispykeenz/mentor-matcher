import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingWizard } from '@/components/forms/onboarding-wizard';
import { getCurrentUserProfile } from '@/lib/server/profile-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/server/auth-guard';

async function ProfileEditorContent() {
  await requireAuth(); // Ensure user is authenticated
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Card>
        <CardContent className="space-y-8 p-8">
          <OnboardingWizard profile={profile ?? undefined} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditProfilePage() {
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
        <ProfileEditorContent />
      </Suspense>
    </div>
  );
}
