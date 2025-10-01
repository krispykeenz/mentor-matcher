"use client";

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Mode = 'sign-in' | 'sign-up';

type Status = 'idle' | 'processing' | 'error';

export default function ClientComplete() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signInWithMagicLink } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState('');
  const mode = (searchParams.get('mode') as Mode) ?? 'sign-in';

  const complete = useCallback(
    async (targetEmail: string) => {
      try {
        setStatus('processing');
        await signInWithMagicLink(targetEmail, window.location.href);

        const response = await fetch('/api/profile');
        if (response.status === 401) {
          toast.error('Your link has expired. Please request a new one.');
          setStatus('error');
          return;
        }
        if (!response.ok) {
          throw new Error('Profile fetch failed');
        }

        const data = (await response.json()) as {
          profile: Record<string, unknown> | null;
          hasProfile: boolean;
        };

        const destination = data.hasProfile ? '/profile' : '/onboarding';
        router.replace(destination);
      } catch (error) {
        console.error('Magic link completion failed', error);
        toast.error('We could not complete your sign-in. Request a new link.');
        setStatus('error');
        setNeedsEmail(true);
      }
    },
    [router, signInWithMagicLink],
  );

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (storedEmail) {
      void complete(storedEmail);
    } else {
      setNeedsEmail(true);
    }
  }, [complete]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Enter the same email address that requested the link.');
      return;
    }
    setNeedsEmail(false);
    void complete(email.trim());
  };

  const heading =
    needsEmail
      ? 'Confirm your email'
      : status === 'processing'
        ? mode === 'sign-in'
          ? 'Signing you in…'
          : 'Setting up your profile…'
        : status === 'error'
          ? 'There was a problem with your link'
          : 'Finishing up…';

  const description = needsEmail
    ? 'Enter the email you used when requesting this link so we can finish signing you in.'
    : status === 'error'
      ? 'Please go back and request a fresh magic link to continue.'
      : 'Hang tight while we verify your secure link.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sand-100 px-6 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8 text-center">
          {!needsEmail && (
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          )}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-slate-900">{heading}</h1>
            <p className="text-sm text-slate-600">{description}</p>
          </div>

          {needsEmail && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-left"
              aria-label="Confirm email for magic link"
            >
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Email address</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@healthmail.co.za"
                  required
                />
              </label>
              <Button type="submit" className="w-full">
                Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/signin')}
              >
                Back to sign-in
              </Button>
            </form>
          )}

          {status === 'error' && !needsEmail && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/signin')}
            >
              Back to sign-in
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
