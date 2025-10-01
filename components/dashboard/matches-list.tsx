import { getAdminServices } from '@/lib/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { MatchActions } from '@/components/dashboard/match-actions';

async function fetchMatches() {
  const session = cookies().get('__session');
  if (!session) return [] as any[];
  const auth = getAuth();
  const decoded = await auth.verifySessionCookie(session.value);
  const { db } = getAdminServices();
  const snapshot = await db
    .collection('matches')
    .where('participants', 'array-contains', decoded.uid)
    .get();
  let matches = snapshot.empty
    ? [
        ...(
          await db
            .collection('matches')
            .where('mentorId', '==', decoded.uid)
            .get()
        ).docs,
        ...(
          await db
            .collection('matches')
            .where('menteeId', '==', decoded.uid)
            .get()
        ).docs,
      ].map((doc) => doc.data())
    : snapshot.docs.map((doc) => doc.data());

  // Enrich with avatar URLs and names from profiles_public
  const ids = new Set<string>();
  matches.forEach((m: any) => {
    if (m.mentorId) ids.add(m.mentorId);
    if (m.menteeId) ids.add(m.menteeId);
  });
  const profileDocs = await Promise.all(
    Array.from(ids).map((id) => db.collection('profiles_public').doc(id).get()),
  );
  const profileMap = new Map(
    profileDocs
      .filter((d) => d.exists)
      .map((d) => [d.id, d.data() as any]),
  );

  matches = matches.map((m: any) => ({
    ...m,
    mentorName: m.mentorName || profileMap.get(m.mentorId)?.fullName || 'Mentor',
    menteeName: m.menteeName || profileMap.get(m.menteeId)?.fullName || 'Mentee',
    mentorPhoto: profileMap.get(m.mentorId)?.photoUrl || null,
    menteePhoto: profileMap.get(m.menteeId)?.photoUrl || null,
  }));

  return matches;
}

export async function MatchesList() {
  const matches = await fetchMatches();

  const userId = (await (async () => {
    try {
      const { getAuth } = await import('firebase-admin/auth');
      const { cookies } = await import('next/headers');
      const session = cookies().get('__session');
      if (!session) return null;
      const auth = getAuth();
      const decoded = await auth.verifySessionCookie(session.value);
      return decoded.uid as string;
    } catch {
      return null;
    }
  })());

  const [activeMatches, archivedMatches] = (() => {
    const hiddenFor = (m: any) => Array.isArray(m.hiddenFor) ? m.hiddenFor : [];
    return [
      matches.filter((m: any) => !hiddenFor(m).includes(userId)),
      matches.filter((m: any) => hiddenFor(m).includes(userId)),
    ];
  })();

  return (
    <div className="mt-6 grid gap-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Active</h2>
        {activeMatches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <img
              src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop"
              alt="Warm coffee and notebook"
              className="mx-auto mb-4 h-28 w-28 rounded-2xl object-cover shadow-soft"
              loading="lazy"
            />
            <p className="text-sm text-slate-600">No active mentorships yet. Start by discovering matches.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeMatches.map((match: any) => (
              <Card key={match.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2">
                      <Avatar src={match.mentorPhoto} alt={match.mentorName ?? 'Mentor'} className="h-10 w-10 ring-2 ring-white" />
                      <Avatar src={match.menteePhoto} alt={match.menteeName ?? 'Mentee'} className="h-10 w-10 ring-2 ring-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {match.mentorName ?? 'Mentor'} &amp; {match.menteeName ?? 'Mentee'}
                      </h3>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{match.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {typeof match.unreadCount === 'number' && match.unreadCount > 0 && (
                      <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700">
                        {match.unreadCount} new
                      </span>
                    )}
                    <Button asChild>
                      <Link href={`/chat/${match.id}`}>Open chat</Link>
                    </Button>
                    {/* @ts-expect-error Server-to-client import for actions */}
                    <MatchActions matchId={match.id} mode="active" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Archived</h2>
        {archivedMatches.length === 0 ? (
          <p className="text-sm text-slate-500">No archived chats.</p>
        ) : (
          <div className="grid gap-4">
            {archivedMatches.map((match: any) => (
              <Card key={match.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2">
                      <Avatar src={match.mentorPhoto} alt={match.mentorName ?? 'Mentor'} className="h-10 w-10 ring-2 ring-white" />
                      <Avatar src={match.menteePhoto} alt={match.menteeName ?? 'Mentee'} className="h-10 w-10 ring-2 ring-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {match.mentorName ?? 'Mentor'} &amp; {match.menteeName ?? 'Mentee'}
                      </h3>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{match.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* @ts-expect-error Server-to-client import for actions */}
                    <MatchActions matchId={match.id} mode="archived" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
