import { NextResponse, type NextRequest } from 'next/server';
import { requestSchema } from '@/lib/utils/schemas';
import { getAdminServices } from '@/lib/firebase/server';
import { requireUser } from '@/lib/server/auth';
import {
  sendPushNotification,
  sendEmailNotification,
} from '@/lib/server/notifications';

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
    const sentSnap = await db
      .collection('requests')
      .where('senderUserId', '==', userId)
      .get();
    const receivedSnap = await db
      .collection('requests')
      .where('receiverUserId', '==', userId)
      .get();

    const sent = sentSnap.docs.map((doc) => doc.data() as any);
    const received = receivedSnap.docs.map((doc) => doc.data() as any);

    const ids = new Set<string>();
    [...sent, ...received].forEach((r) => {
      if (r.senderUserId) ids.add(r.senderUserId);
      if (r.receiverUserId) ids.add(r.receiverUserId);
    });
    const profileDocs = await Promise.all(
      Array.from(ids).map((id) => db.collection('profiles_public').doc(id).get()),
    );
    const profileMap = new Map(
      profileDocs
        .filter((d) => d.exists)
        .map((d) => [d.id, d.data() as any]),
    );

    const enrich = (r: any) => {
      const createdAt = r.createdAt ? Date.parse(r.createdAt) : 0;
      const isRecent = createdAt > 0 ? Date.now() - createdAt < 1000 * 60 * 60 * 48 : false;
      return {
        ...r,
        senderPhoto: profileMap.get(r.senderUserId)?.photoUrl || null,
        receiverPhoto: profileMap.get(r.receiverUserId)?.photoUrl || null,
        senderName: r.senderName || profileMap.get(r.senderUserId)?.fullName || 'User',
        receiverName:
          r.receiverName || profileMap.get(r.receiverUserId)?.fullName || 'User',
        isNew: r.status === 'pending' && r.receiverUserId === userId && isRecent,
      };
    };

    return NextResponse.json({
      sent: sent.map(enrich),
      received: received.map(enrich),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to fetch requests' },
      { status: 400 },
    );
  }
}
