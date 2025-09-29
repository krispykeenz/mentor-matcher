import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';

export async function requireAdmin() {
  const session = cookies().get('__session');
  if (!session) throw new Error('Unauthenticated');
  const auth = getAuth();
  const decoded = await auth.verifySessionCookie(session.value);
  const role = (decoded as any).role || (decoded as any)['role'];
  const claimRole = (decoded as any)?.claims?.role;
  if (role !== 'admin' && claimRole !== 'admin') {
    throw new Error('Forbidden');
  }
  return decoded.uid;
}
