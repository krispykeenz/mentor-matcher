'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendMagicLink, signInWithGoogle } = useAuth();
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await sendMagicLink(email);
      toast.success('Magic link sent! Check your inbox.');
      router.push('/onboarding');
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
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              Sign in to MentorMatch SA
            </h1>
            <p className="text-sm text-slate-600">
              We use secure passwordless links to keep your data safe.
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@healthmail.co.za"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending magic link…' : 'Email me a sign-in link'}
            </Button>
          </form>
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
            By signing in you agree to our{' '}
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
