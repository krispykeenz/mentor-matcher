import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().set({ name: '__session', value: '', path: '/', maxAge: 0 });
  return NextResponse.json({ status: 'signed-out' });
}
