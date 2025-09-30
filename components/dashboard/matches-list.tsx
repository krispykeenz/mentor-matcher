import { getAdminServices } from '@/lib/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

async function fetchMatches() {
  const session = cookies().get('__session');
  if (!session) return [];
  const auth = getAuth();
  const decoded = await auth.verifySessionCookie(session.value);
  const { db } = getAdminServices();
  const snapshot = await db
    .collection('matches')
    .where('participants', 'array-contains', decoded.uid)
    .get();
  if (!snapshot.empty) {
    return snapshot.docs.map((doc) => doc.data());
  }
  const mentor = await db
    .collection('matches')
    .where('mentorId', '==', decoded.uid)
    .get();
  const mentee = await db
    .collection('matches')
    .where('menteeId', '==', decoded.uid)
    .get();
  return [...mentor.docs, ...mentee.docs].map((doc) => doc.data());
}

export async function MatchesList() {
  const matches = await fetchMatches();

  if (matches.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate-500">No active mentorships yet.</p>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {matches.map((match: any) => (
        <Card key={match.id}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {match.mentorName ?? 'Mentor'} &amp;{' '}
                {match.menteeName ?? 'Mentee'}
              </h3>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {match.status}
              </p>
            </div>
            <Button asChild>
              <Link href={`/chat/${match.id}`}>Open chat</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
