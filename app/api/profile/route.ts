import { NextResponse, type NextRequest } from 'next/server';
import { baseProfileSchema } from '@/lib/utils/schemas';
import type { ZodError } from 'zod';
import { upsertProfile } from '@/lib/server/repositories/profiles';
import { getAdminServices } from '@/lib/firebase/server';
import { requireUser } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const payload = await request.json();
    const data = baseProfileSchema.parse(payload);
    await upsertProfile(userId, data);
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    if (error?.message === 'Unauthenticated') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    // Surface Zod validation errors clearly
    if (error?.name === 'ZodError' && Array.isArray(error.issues)) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: 'Unable to save profile' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUser();
    const { db } = getAdminServices();

    const [userDoc, publicDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('profiles_public').doc(userId).get(),
    ]);

    const profile = userDoc.exists ? (userDoc.data() as Record<string, unknown>) : null;
    const hasProfile = Boolean(
      (userDoc.exists && profile && (profile as any).fullName && (profile as any).occupation && (profile as any).bioShort) ||
        (publicDoc.exists && publicDoc.data() && (publicDoc.data() as any).fullName),
    );

    return NextResponse.json({ profile, hasProfile });
  } catch (error: any) {
    if (error?.message === 'Unauthenticated') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    console.error('GET /api/profile failed', error);
    return NextResponse.json({ error: 'Unable to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
