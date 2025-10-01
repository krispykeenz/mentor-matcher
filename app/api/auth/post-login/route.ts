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
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
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
    const userDoc = await userRef.get();
    const now = new Date().toISOString();
    const normalizedEmail = decoded.email?.toLowerCase() ?? null;

    await userRef.set(
      {
        id: decoded.uid,
        email: decoded.email ?? null,
        emailNormalized: normalizedEmail,
        updatedAt: now,
        ...(userDoc.exists ? {} : { createdAt: now }),
      },
      { merge: true },
    );

    const profileRef = db.collection('profiles_public').doc(decoded.uid);
    const profileDoc = await profileRef.get();
    const profilePayload: Record<string, unknown> = {
      id: decoded.uid,
      email: decoded.email ?? null,
      emailNormalized: normalizedEmail,
      updatedAt: now,
    };
    if (!profileDoc.exists) {
      profilePayload.discoverable = false;
    }

    await profileRef.set(profilePayload, { merge: true });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('post-login error', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 400 },
    );
  }
}
