export async function handlePostAuthRedirect(): Promise<string> {
  try {
    const response = await fetch('/api/profile');
    if (response.status === 401) {
      throw new Error('Unauthenticated');
    }
    if (!response.ok) {
      throw new Error('Profile fetch failed');
    }

    const data = (await response.json()) as {
      profile: Record<string, unknown> | null;
      hasProfile: boolean;
    };

    // If user has a complete profile, send them to discovery page
    // If not, send them to onboarding
    return data.hasProfile ? '/discover' : '/onboarding';
  } catch (error) {
    console.error('Post-auth routing failed:', error);
    // Default to onboarding if we can't determine profile status
    return '/onboarding';
  }
}