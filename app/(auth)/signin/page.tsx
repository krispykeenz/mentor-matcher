'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { isDemoMode } from '@/lib/demo/demo-mode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

const MODES = [
  { id: 'sign-in', label: 'Sign in' },
  { id: 'sign-up', label: 'Create profile' },
] as const;

type Mode = (typeof MODES)[number]['id'];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('sign-in');
  const [linkSent, setLinkSent] = useState(false);
  const [lastEmail, setLastEmail] = useState('');
  const { sendMagicLink, signInWithGoogle } = useAuth();

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setLinkSent(false);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setLinkSent(false);

    const trimmedEmail = email.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    try {
      if (isDemoMode) {
        toast.success('Demo mode enabled — signing you in locally.');
        router.push('/discover');
        return;
      }

      if (!trimmedEmail) {
        toast.error('Please enter your email address.');
        return;
      }

      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        toast.error('We could not verify your email. Please try again.');
        return;
      }

      const { exists, hasProfile } = (await response.json()) as {
        exists: boolean;
        hasProfile: boolean;
      };

      if (mode === 'sign-in' && !exists) {
        toast.error('We could not find an account for that email. Try creating a profile.');
        return;
      }

      if (mode === 'sign-up' && hasProfile) {
        toast.error('That email already has a profile. Please sign in instead.');
        setMode('sign-in');
        setEmail(trimmedEmail);
        return;
      }

      await sendMagicLink(normalizedEmail, { mode });
      const successMessage =
        mode === 'sign-in'
          ? 'Sign-in link sent! Check your inbox.'
          : 'Welcome! Confirm the email we just sent to start onboarding.';
      toast.success(successMessage);
      setLinkSent(true);
      setLastEmail(trimmedEmail);
      setEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Unable to send link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sand-100 px-6 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-3 text-center">
            <div className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800">
              MentorMatch SA
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {mode === 'sign-in' ? 'Welcome back' : 'Create your profile'}
            </h1>
            <p className="text-sm text-slate-600">
              {mode === 'sign-in'
                ? 'Sign in to manage your profile and mentorship journeys.'
                : 'Start your onboarding to join the mentorship community.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModeChange(item.id)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  mode === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-white/60',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                required={!isDemoMode}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isDemoMode ? 'Optional in demo mode' : 'you@healthmail.co.za'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending link…' : mode === 'sign-in' ? 'Email me a sign-in link' : 'Send onboarding link'}
            </Button>
            <p className="text-xs text-slate-500">
              Didn&apos;t get the email? Please check your spam or junk folder and mark it as &quot;Not spam&quot;.
            </p>
          </form>

          {linkSent && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              We sent a secure link to <strong>{lastEmail}</strong>. Open it on this
              device to {mode === 'sign-in' ? 'sign in' : 'finish onboarding'}. If you don&apos;t see it, please check your spam/junk folder.
            </div>
          )}

          {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === 'true' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={signInWithGoogle}
            >
              Continue with Google
            </Button>
          )}

          <p className="text-xs text-slate-500">
            By continuing you agree to our{' '}
            <a className="underline" href="/legal/terms">
              Terms of Use
            </a>{' '}
            and{' '}
            <a className="underline" href="/legal/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


