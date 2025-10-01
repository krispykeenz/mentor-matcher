import { cookies } from 'next/headers';
import { getAdminServices } from '@/lib/firebase/server';

export async function requireUser(): Promise<string> {
  const session = cookies().get('__session');
  if (!session) {
    throw new Error('Unauthenticated');
  }
  
  const { auth } = getAdminServices();
  try {
    const decoded = await auth.verifySessionCookie(session.value);
    return decoded.uid;
  } catch (error) {
    console.error('Session verification failed:', error);
    throw new Error('Unauthenticated');
  }
}