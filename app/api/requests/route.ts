import { NextResponse, type NextRequest } from 'next/server';
import { requestSchema } from '@/lib/utils/schemas';
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

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const payload = requestSchema.parse(await request.json());
    const { db } = getAdminServices();
    const ref = db.collection('requests').doc();
    const senderDoc = await db.collection('users').doc(userId).get();
    const receiverDoc = await db
      .collection('users')
      .doc(payload.receiverUserId)
      .get();
    const senderEmail = senderDoc.data()?.email ?? '';
    const receiverEmail = receiverDoc.data()?.email ?? '';
    const senderName = senderDoc.data()?.fullName ?? 'MentorMatch user';
    await ref.set({
      id: ref.id,
      senderUserId: userId,
      receiverUserId: payload.receiverUserId,
      senderName,
      receiverName: receiverDoc.data()?.fullName ?? 'MentorMatch mentor',
      senderEmail,
      receiverEmail,
      message: payload.message,
      goals: payload.goals,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await sendPushNotification(payload.receiverUserId, {
      title: 'New mentorship request',
      body: payload.message,
    });
    await sendEmailNotification(
      receiverEmail,
      'New mentorship request',
      `<p>${senderName} says:</p><p>${payload.message}</p>`,
    );
    return NextResponse.json({ id: ref.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to send request' },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const userId = await requireUser();
    const { db } = getAdminServices();
    const sent = await db
      .collection('requests')
      .where('senderUserId', '==', userId)
      .get();
    const received = await db
      .collection('requests')
      .where('receiverUserId', '==', userId)
      .get();
    return NextResponse.json({
      sent: sent.docs.map((doc) => doc.data()),
      received: received.docs.map((doc) => doc.data()),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to fetch requests' },
      { status: 400 },
    );
  }
}
