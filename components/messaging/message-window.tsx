'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { MessageInput } from '@/components/messaging/message-input';
import { Card, CardContent } from '@/components/ui/card';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load messages');
  }
  return res.json();
};

export function MessageWindow({ matchId }: { matchId: string }) {
  const { data, mutate } = useSWR(`/api/matches/${matchId}/messages`, fetcher, {
    refreshInterval: 5000,
  });
  const [sending, setSending] = useState(false);

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

  const messages = data?.messages ?? [];

  return (
    <Card>
      <CardContent className="flex h-[70vh] flex-col gap-4 p-6">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-100 p-4">
          {messages.map((message: any) => (
            <div key={message.id} className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
              {message.body}
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet. Start the conversation!</p>}
        </div>
        <MessageInput onSend={sendMessage} disabled={sending} />
      </CardContent>
    </Card>
  );
}
