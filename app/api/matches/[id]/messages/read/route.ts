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

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireUser();
    const { db } = getAdminServices();
    const matchRef = db.collection('matches').doc(params.id);
    const matchDoc = await matchRef.get();
    if (!matchDoc.exists) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    const messagesSnap = await matchRef
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const batch = db.batch();
    let updated = 0;
    messagesSnap.docs.forEach((doc) => {
      const data = doc.data() as any;
      const readBy: string[] = Array.isArray(data.readBy) ? data.readBy : [];
      if (!readBy.includes(userId)) {
        const ref = matchRef.collection('messages').doc(doc.id);
        batch.update(ref, { readBy: [...readBy, userId] });
        updated += 1;
      }
    });
    if (updated > 0) {
      await batch.commit();
    }
    return NextResponse.json({ updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to mark messages read' },
      { status: 400 },
    );
  }
}
