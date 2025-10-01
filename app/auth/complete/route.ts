import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const target = new URL('/complete', request.nextUrl.origin);
  // Preserve query string (e.g., mode, oobCode, apiKey) just in case
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, { status: 307 });
}
