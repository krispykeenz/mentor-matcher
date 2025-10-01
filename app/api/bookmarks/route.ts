import { NextResponse, type NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { requireUser } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const { targetUserId } = await request.json();
    const { db } = getAdminServices();
    await db.collection('bookmarks').doc(`${userId}_${targetUserId}`).set({
      userId,
      targetUserId,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to save bookmark' },
      { status: 400 },
    );
  }
}
