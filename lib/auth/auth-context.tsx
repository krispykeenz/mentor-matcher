'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailLink,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { initializeClientFirebase } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
};

type AuthFlowMode = 'sign-in' | 'sign-up';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  sendMagicLink: (
    email: string,
    options?: { mode?: AuthFlowMode },
  ) => Promise<void>;
  signInWithMagicLink: (email: string, link?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const auth = useMemo(() => {
    if (typeof window !== 'undefined') {
      initializeClientFirebase();
      return getAuth();
    }
    return null;
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const idToken = await firebaseUser.getIdToken();
        try {
          const response = await fetch('/api/auth/post-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          if (!response.ok) {
            console.error('post-login failed:', response.status, await response.text());
          } else {
            console.log('post-login successful');
          }
        } catch (error) {
          console.error('post-login error:', error);
        }
        const isAdmin = tokenResult.claims?.role === 'admin';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      signOutUser: async () => {
        if (!auth) throw new Error('Firebase not initialized');
        await signOut(auth);
        await fetch('/api/auth/logout', { method: 'POST' }).catch(
          () => undefined,
        );
        Cookies.remove('onboarding');
        router.push('/');
      },
      sendMagicLink: async (
        email: string,
        options?: { mode?: AuthFlowMode },
      ) => {
        if (!auth) throw new Error('Firebase not initialized');
        const normalizedEmail = email.trim();
        const callbackUrl = new URL('/complete', window.location.origin);
        const mode = options?.mode ?? 'sign-in';
        callbackUrl.searchParams.set('mode', mode);
        const settings = {
          url: callbackUrl.toString(),
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, normalizedEmail, settings);
        window.localStorage.setItem('emailForSignIn', normalizedEmail);
        window.localStorage.setItem('authFlow', mode);
      },
      signInWithMagicLink: async (email: string, link?: string) => {
        if (!auth) throw new Error('Firebase not initialized');
        const signInEmail =
          email || window.localStorage.getItem('emailForSignIn') || '';
        const href = link || window.location.href;
        if (!isSignInWithEmailLink(auth, href)) throw new Error('Invalid link');
        await signInWithEmailLink(auth, signInEmail, href);
        try {
          const current = auth.currentUser;
          if (current) {
            const idToken = await current.getIdToken(true);
            try {
              const response = await fetch('/api/auth/post-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
              });
              if (!response.ok) {
                console.error('magic link post-login failed:', response.status, await response.text());
              }
            } catch (error) {
              console.error('magic link post-login error:', error);
            }
          }
        } catch {}
        window.localStorage.removeItem('emailForSignIn');
        window.localStorage.removeItem('authFlow');
      },
      signInWithGoogle: async () => {
        if (!auth) throw new Error('Firebase not initialized');
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        
        // Wait a moment for the auth state to update and session to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Handle post-authentication routing
        try {
          const { handlePostAuthRedirect } = await import('@/lib/auth/routing');
          const destination = await handlePostAuthRedirect();
          router.push(destination);
        } catch (error) {
          console.error('Post-auth routing failed:', error);
          // Fallback to discovery page
          router.push('/discover');
        }
      },
    };
  }, [auth, user, loading, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

