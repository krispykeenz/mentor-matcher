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

    let matches = snapshot.empty
      ? [
          ...(
            await db
              .collection('matches')
              .where('mentorId', '==', userId)
              .get()
          ).docs,
          ...(
            await db
              .collection('matches')
              .where('menteeId', '==', userId)
              .get()
          ).docs,
        ].map((doc) => doc.data() as any)
      : snapshot.docs.map((doc) => doc.data() as any);

    // Filter out hidden matches for this user
    matches = matches.filter((m: any) => !Array.isArray(m.hiddenFor) || !m.hiddenFor.includes(userId));

    // Compute unread counts (recent messages) and add participant names/photos
    const ids = new Set<string>();
    matches.forEach((m: any) => {
      if (m.mentorId) ids.add(m.mentorId);
      if (m.menteeId) ids.add(m.menteeId);
    });
    const profileDocs = await Promise.all(
      Array.from(ids).map((id) => db.collection('profiles_public').doc(id).get()),
    );
    const profileMap = new Map(
      profileDocs
        .filter((d) => d.exists)
        .map((d) => [d.id, d.data() as any]),
    );

    const withMeta = await Promise.all(
      matches.map(async (m: any) => {
        try {
          const matchRef = db.collection('matches').doc(m.id);
          const msgSnap = await matchRef
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
          const unreadCount = msgSnap.docs.filter((d) => {
            const data = d.data() as any;
            const readBy = Array.isArray(data.readBy) ? data.readBy : [];
            return !readBy.includes(userId) && data.senderId !== userId;
          }).length;
          return {
            ...m,
            unreadCount,
            mentorName:
              m.mentorName || profileMap.get(m.mentorId)?.fullName || 'Mentor',
            menteeName:
              m.menteeName || profileMap.get(m.menteeId)?.fullName || 'Mentee',
            mentorPhoto: profileMap.get(m.mentorId)?.photoUrl || null,
            menteePhoto: profileMap.get(m.menteeId)?.photoUrl || null,
          };
        } catch {
          return {
            ...m,
            unreadCount: 0,
            mentorName:
              m.mentorName || profileMap.get(m.mentorId)?.fullName || 'Mentor',
            menteeName:
              m.menteeName || profileMap.get(m.menteeId)?.fullName || 'Mentee',
            mentorPhoto: profileMap.get(m.mentorId)?.photoUrl || null,
            menteePhoto: profileMap.get(m.menteeId)?.photoUrl || null,
          };
        }
      }),
    );

    return NextResponse.json({ matches: withMeta });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to fetch matches' },
      { status: 400 },
    );
  }
}
