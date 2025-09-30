import { NextResponse, type NextRequest } from 'next/server';
import { fetchDiscoveryProfiles } from '@/lib/server/repositories/profiles';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};
    let viewerId: string | undefined = undefined;
    searchParams.forEach((value, key) => {
      if (filters[key]) {
        if (Array.isArray(filters[key])) {
          (filters[key] as string[]).push(value);
        } else {
          filters[key] = [filters[key] as string, value];
        }
      } else {
        filters[key] = value;
      }
    });
    const session = cookies().get('__session');
    if (session) {
      const auth = getAuth();
      const decoded = await auth.verifySessionCookie(session.value);
      viewerId = decoded.uid;
    }
    const profiles = await fetchDiscoveryProfiles(filters, viewerId);
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch discovery feed' },
      { status: 400 },
    );
  }
}
