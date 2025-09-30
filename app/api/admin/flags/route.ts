import { NextResponse, type NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { requireAdmin } from '@/lib/server/require-admin';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const payload = await request.json();
    const { db } = getAdminServices();
    await db
      .collection('admin')
      .doc('featureFlags')
      .set(payload, { merge: true });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to update flags' },
      { status: 400 },
    );
  }
}
