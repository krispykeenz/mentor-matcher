import { NextResponse, type NextRequest } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { requireAdmin } from '@/lib/server/require-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const { status, action } = await request.json();
    const { db } = getAdminServices();
    await db.collection('reports').doc(params.id).update({
      status,
      action,
      actionedAt: new Date().toISOString(),
    });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unable to update report' },
      { status: 400 },
    );
  }
}
