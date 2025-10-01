'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import { MessageInput } from '@/components/messaging/message-input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load messages');
  }
  return res.json();
};

export function MessageWindow({ matchId }: { matchId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { data, mutate } = useSWR(`/api/matches/${matchId}/messages`, fetcher, {
    refreshInterval: 5000,
  });
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Mark messages as read when loaded
  useEffect(() => {
    if (!data) return;
    void fetch(`/api/matches/${matchId}/messages/read`, { method: 'POST' });
  }, [data, matchId]);

  const sendMessage = async (body: string) => {
    setSending(true);
    try {
      await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, body, type: 'text' }),
      });
      mutate();
    } finally {
      setSending(false);
    }
  };

  const deleteChat = async () => {
    const ok = window.confirm('Delete this chat? This will remove all messages.');
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Chat deleted');
        router.push('/matches');
      } else {
        toast.error('Could not delete chat');
      }
    } finally {
      setDeleting(false);
    }
  };

  const messages = data?.messages ?? [];
  const peer = data?.peer as { id: string; name: string; photoUrl?: string | null } | undefined;

  return (
    <Card>
      <CardContent className="flex h-[70vh] flex-col gap-4 p-6">
        {peer && (
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <Avatar src={peer.photoUrl || null} alt={peer.name} className="h-10 w-10" />
              <div>
                <p className="text-sm font-medium text-slate-900">{peer.name}</p>
                <p className="text-xs text-slate-500">Active mentorship</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void (async () => { await fetch(`/api/matches/${matchId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'hide' }) }); router.push('/matches'); })()}
                disabled={deleting}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
              >
                Hide
              </button>
              <button
                type="button"
                onClick={() => void deleteChat()}
                disabled={deleting}
                className="rounded-xl border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-100 p-4">
          {messages.map((message: any) => {
            const mine = user?.uid && message.senderId === user.uid;
            return (
              <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`flex max-w-[80%] items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar src={mine ? (data?.me?.photoUrl ?? null) : (data?.peer?.photoUrl ?? null)} alt={mine ? 'You' : (data?.peer?.name ?? 'User')} className="h-8 w-8" />
                  <div className={`${mine ? 'bg-brand-600 text-white' : 'bg-white text-slate-700'} rounded-2xl px-3 py-2 shadow-sm`}>
                    <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop"
                alt="Warm table with tea"
                className="h-24 w-24 rounded-2xl object-cover shadow-soft"
                loading="lazy"
              />
              <p className="text-sm text-slate-500">No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>
        <MessageInput onSend={sendMessage} disabled={sending} mePhotoUrl={data?.me?.photoUrl ?? null} />
      </CardContent>
    </Card>
  );
}
