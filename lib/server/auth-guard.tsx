import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAdminServices } from '@/lib/firebase/server';

export async function requireAuth(): Promise<string> {
  const sessionCookie = cookies().get('__session');
  
  if (!sessionCookie) {
    redirect('/signin');
  }
  
  try {
    const { auth } = getAdminServices();
    const decoded = await auth.verifySessionCookie(sessionCookie.value);
    return decoded.uid;
  } catch (error) {
    console.error('Session verification failed:', error);
    redirect('/signin');
  }
}

export async function getUserIfAuthenticated(): Promise<string | null> {
  const sessionCookie = cookies().get('__session');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const { auth } = getAdminServices();
    const decoded = await auth.verifySessionCookie(sessionCookie.value);
    return decoded.uid;
  } catch (error) {
    return null;
  }
}