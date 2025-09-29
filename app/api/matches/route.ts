import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const userId = await requireUser();
    const { db } = getAdminServices();
    const snapshot = await db
      .collection('matches')
      .where('participants', 'array-contains', userId)
      .get();
    if (!snapshot.empty) {
      return NextResponse.json({ matches: snapshot.docs.map((doc) => doc.data()) });
    }
    const asMentor = await db.collection('matches').where('mentorId', '==', userId).get();
    const asMentee = await db.collection('matches').where('menteeId', '==', userId).get();
    return NextResponse.json({
      matches: [...asMentor.docs, ...asMentee.docs].map((doc) => ({ participants: [], ...doc.data() })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch matches' }, { status: 400 });
  }
}
