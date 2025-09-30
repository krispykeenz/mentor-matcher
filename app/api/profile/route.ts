import { NextResponse, type NextRequest } from 'next/server';
import { baseProfileSchema } from '@/lib/utils/schemas';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { upsertProfile } from '@/lib/server/repositories/profiles';

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
    const payload = await request.json();
    const data = baseProfileSchema.parse(payload);
    await upsertProfile(userId, data);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to save profile' },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
