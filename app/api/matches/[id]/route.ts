import { NextResponse, type NextRequest } from 'next/server';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireUser();
    const { db } = getAdminServices();
    const { action } = await request.json();
    const matchRef = db.collection('matches').doc(params.id);
    const snap = await matchRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    const match = snap.data() as any;
    if (!match || ![match.mentorId, match.menteeId].includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hiddenFor: string[] = Array.isArray(match.hiddenFor) ? match.hiddenFor : [];
    if (action === 'hide') {
      if (!hiddenFor.includes(userId)) hiddenFor.push(userId);
      await matchRef.set({ hiddenFor }, { merge: true });
      return NextResponse.json({ status: 'hidden' });
    }
    if (action === 'unhide') {
      const next = hiddenFor.filter((id) => id !== userId);
      await matchRef.set({ hiddenFor: next }, { merge: true });
      return NextResponse.json({ status: 'unhidden' });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/matches/[id] failed', error);
    const message = (error as any)?.message || 'Unable to update match';
    const status = message === 'Unauthenticated' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireUser();
    const { db } = getAdminServices();
    const matchRef = db.collection('matches').doc(params.id);
    const snap = await matchRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    const match = snap.data() as any;
    if (!match || ![match.mentorId, match.menteeId].includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete messages in chunks to avoid batch limits
    const deleteBatch = async () => {
      const batch = db.batch();
      const msgs = await matchRef
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(400)
        .get();
      msgs.docs.forEach((d) => batch.delete(d.ref));
      if (!msgs.empty) {
        await batch.commit();
        return true;
      }
      return false;
    };

    while (await deleteBatch()) {}

    await matchRef.delete();
    return NextResponse.json({ status: 'deleted' });
  } catch (error) {
    console.error('DELETE /api/matches/[id] failed', error);
    const message = (error as any)?.message || 'Unable to delete chat';
    const status = message === 'Unauthenticated' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
