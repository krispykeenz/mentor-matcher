import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

async function requireUser() {
  const session = cookies().get('__session');
  if (!session) throw new Error('Unauthenticated');
  const auth = getAuth();
  const decoded = await auth.verifySessionCookie(session.value);
  return decoded.uid;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const { targetUserId } = await request.json();
    const { db } = getAdminServices();
    await db
      .collection('bookmarks')
      .doc(`${userId}_${targetUserId}`)
      .set({
        userId,
        targetUserId,
        createdAt: new Date().toISOString(),
      });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to save bookmark' }, { status: 400 });
  }
}
