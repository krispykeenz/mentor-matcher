import { NextResponse, type NextRequest } from 'next/server';
import { matchMessageSchema } from '@/lib/utils/schemas';
import { getAdminServices } from '@/lib/firebase/server';
import { requireUser } from '@/lib/server/auth';
import { sendPushNotification } from '@/lib/server/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await requireUser();
    const payload = matchMessageSchema.parse(await request.json());
    const { db } = getAdminServices();
    const matchRef = db.collection('matches').doc(params.id);
    const matchDoc = await matchRef.get();
    if (!matchDoc.exists) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    const match = matchDoc.data()!;
    if (![match.mentorId, match.menteeId].includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const messagesRef = matchRef.collection('messages').doc();
    await messagesRef.set({
      id: messagesRef.id,
      matchId: params.id,
      senderId: userId,
      body: payload.body,
      type: payload.type,
      createdAt: new Date().toISOString(),
      readBy: [userId],
    });
    const target = match.mentorId === userId ? match.menteeId : match.mentorId;
    await sendPushNotification(target, {
      title: 'New message',
      body: payload.body.slice(0, 120),
    });
    return NextResponse.json({ id: messagesRef.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to send message' },
      { status: 400 },
    );
  }
}

export async function GET(
  request: NextRequest,
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
    const match = matchDoc.data() as any;
    if (!match || ![match.mentorId, match.menteeId].includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const peerId = match.mentorId === userId ? match.menteeId : match.mentorId;
    const peerProfile = await db.collection('profiles_public').doc(peerId).get();
    const peer = peerProfile.exists
      ? {
          id: peerId,
          name: (peerProfile.data() as any)?.fullName ?? 'User',
          photoUrl: (peerProfile.data() as any)?.photoUrl ?? null,
        }
      : { id: peerId, name: 'User', photoUrl: null };

    // Include current user info for chat UI
    const meProfileDoc = await db.collection('profiles_public').doc(userId).get();
    const me = meProfileDoc.exists
      ? {
          id: userId,
          name: (meProfileDoc.data() as any)?.fullName ?? 'You',
          photoUrl: (meProfileDoc.data() as any)?.photoUrl ?? null,
        }
      : { id: userId, name: 'You', photoUrl: null };

    const messagesSnapshot = await matchRef
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(200)
      .get();
    return NextResponse.json({
      peer,
      me,
      messages: messagesSnapshot.docs.map((doc) => doc.data()),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to fetch messages' },
      { status: 400 },
    );
  }
}
