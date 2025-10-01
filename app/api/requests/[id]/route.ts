import { NextResponse, type NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import {
  sendPushNotification,
  sendEmailNotification,
} from '@/lib/server/notifications';

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
    const { status } = await request.json();
    const allowed = new Set(['accepted', 'declined', 'withdrawn']);
    if (!allowed.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const { db } = getAdminServices();
    const ref = db.collection('requests').doc(params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const data = doc.data()!;
    if (![data.receiverUserId, data.senderUserId].includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await ref.update({ status, updatedAt: new Date().toISOString() });
    let matchId: string | undefined = undefined;
    if (status === 'accepted') {
      const matchesRef = db.collection('matches').doc();
      await matchesRef.set({
        id: matchesRef.id,
        mentorId: data.receiverUserId,
        menteeId: data.senderUserId,
        mentorName: data.receiverName ?? 'Mentor',
        menteeName: data.senderName ?? 'Mentee',
        participants: [data.receiverUserId, data.senderUserId],
        startedAt: new Date().toISOString(),
        status: 'active',
      });
      matchId = matchesRef.id;
      await sendPushNotification(data.senderUserId, {
        title: 'Mentorship match!',
        body: 'Your request was accepted.',
      });
      await sendEmailNotification(
        data.senderEmail ?? '',
        'Mentorship match confirmed',
        'Your mentorship request has been accepted.',
      );
    }
    return NextResponse.json({ status: 'ok', matchId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to update request' },
      { status: 400 },
    );
  }
}
