import { NextResponse, type NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { db } = getAdminServices();

    let snapshot = await db
      .collection('users')
      .where('emailNormalized', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      snapshot = await db
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();
    }

    if (snapshot.empty) {
      return NextResponse.json({ exists: false, hasProfile: false });
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data() ?? {};

    let hasProfile = Boolean(
      userData.fullName && userData.occupation && userData.bioShort,
    );
    if (!hasProfile) {
      const profileDoc = await db.collection('profiles_public').doc(userId).get();
      hasProfile = profileDoc.exists && Boolean(profileDoc.data()?.fullName);
    }

    return NextResponse.json({ exists: true, hasProfile });
  } catch (error) {
    console.error('check-email error', error);
    return NextResponse.json(
      { error: 'Unable to verify email at this time.' },
      { status: 500 },
    );
  }
}
