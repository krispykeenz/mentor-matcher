import 'server-only';

import { getAdminServices } from '@/lib/firebase/server';
import { cookies } from 'next/headers';

export async function getCurrentUserProfile() {
  const { db, auth } = getAdminServices();
  const sessionCookie = cookies().get('__session');
  if (!sessionCookie) return null;
  try {
    const decoded = await auth.verifySessionCookie(sessionCookie.value);
    const doc = await db.collection('users').doc(decoded.uid).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (error) {
    console.error('Failed to fetch profile', error);
    return null;
  }
}
