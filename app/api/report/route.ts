import { NextResponse, type NextRequest } from 'next/server';
import { reportSchema } from '@/lib/utils/schemas';
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

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const payload = reportSchema.parse(await request.json());
    const { db } = getAdminServices();
    const ref = db.collection('reports').doc();
    await ref.set({
      id: ref.id,
      reporterId: userId,
      targetUserId: payload.targetUserId,
      category: payload.category,
      details: payload.details,
      createdAt: new Date().toISOString(),
      status: 'open',
    });
    return NextResponse.json({ id: ref.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to submit report' }, { status: 400 });
  }
}
