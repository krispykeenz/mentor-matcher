'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
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

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithMagicLink: (email: string, link?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const auth = useMemo(() => {
    initializeClientFirebase();
    return getAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/auth/post-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }).catch(() => undefined);
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
        await signOut(auth);
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
        Cookies.remove('onboarding');
        router.push('/');
      },
      sendMagicLink: async (email: string) => {
        const settings = {
          url: `${window.location.origin}/auth/complete`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, settings);
        window.localStorage.setItem('emailForSignIn', email);
      },
      signInWithMagicLink: async (email: string, link?: string) => {
        const signInEmail =
          email || window.localStorage.getItem('emailForSignIn') || '';
        const href = link || window.location.href;
        if (!isSignInWithEmailLink(auth, href)) throw new Error('Invalid link');
        await signInWithEmailLink(auth, signInEmail, href);
        window.localStorage.removeItem('emailForSignIn');
      },
      signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
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