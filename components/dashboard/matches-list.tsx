'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { MatchActions } from '@/components/dashboard/match-actions';
import { useAuth } from '@/lib/auth/auth-context';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load matches');
  }
  return res.json();
};

export function MatchesList() {
  const { user, loading } = useAuth();
  const { data } = useSWR(user ? '/api/matches' : null, fetcher, {
    refreshInterval: 10000,
  });

  if (loading) {
    return (
      <p className="mt-6 text-sm text-slate-500">Loading matches…</p>
    );
  }

  if (!user) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Please sign in to view your mentorship matches.
      </div>
    );
  }

  const matches = data?.matches ?? [];
  const userId = user.uid;

  const hiddenFor = (m: any) => (Array.isArray(m.hiddenFor) ? m.hiddenFor : []);
  const activeMatches = matches.filter((m: any) => !hiddenFor(m).includes(userId));
  const archivedMatches = matches.filter((m: any) => hiddenFor(m).includes(userId));

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
