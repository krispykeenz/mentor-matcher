import { NextResponse, type NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies().set({
      name: '__session',
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn / 1000,
    });
    const { db } = getAdminServices();
    const userRef = db.collection('users').doc(decoded.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({
        id: decoded.uid,
        email: decoded.email,
        createdAt: new Date().toISOString(),
      });
    }
    await db.collection('profiles_public').doc(decoded.uid).set(
      {
        id: decoded.uid,
        email: decoded.email,
        discoverable: false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('post-login error', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 400 });
  }
}
