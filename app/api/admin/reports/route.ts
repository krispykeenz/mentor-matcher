import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase/server';
import { requireAdmin } from '@/lib/server/require-admin';

export async function GET() {
  try {
    await requireAdmin();
    const { db } = getAdminServices();
    const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').limit(50).get();
    return NextResponse.json({ reports: snapshot.docs.map((doc) => doc.data()) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to fetch reports' }, { status: 403 });
  }
}
