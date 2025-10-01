'use client';

import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load requests');
  }
  return res.json();
};

export function RequestLists() {
  const router = useRouter();
  const { data, mutate } = useSWR('/api/requests', fetcher, {
    refreshInterval: 10000,
  });
  const receivedAll = data?.received ?? [];
  const received = receivedAll.filter((r: any) => (r?.status || 'pending') === 'pending');
  const sent = data?.sent ?? [];

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    // Optimistically remove from the received list so it disappears immediately
    const previous = data;
    if (previous) {
      const optimistic = {
        ...previous,
        received: (previous.received || []).filter((r: any) => r.id !== id),
      };
      mutate(optimistic, false);
    }

    const response = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      let matchId: string | undefined = undefined;
      try {
        const payload = await response.json();
        matchId = payload?.matchId;
      } catch {}
      if (status === 'accepted' && matchId) {
        toast.success('Request accepted', {
          action: {
            label: 'Open chat',
            onClick: () => router.push(`/chat/${matchId}`),
          },
        });
      } else {
        toast.success(`Request ${status}`);
      }
      // Revalidate to sync any other fields
      mutate();
    } else {
      // Roll back optimistic change
      if (previous) mutate(previous, false);
      toast.error('Unable to update request');
    }
  };

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Received</h2>
          {received.length === 0 && (
            <p className="text-sm text-slate-500">No incoming requests yet.</p>
          )}
          {received.map((request: any) => (
            <div
              key={request.id}
              className="space-y-3 rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar src={request.senderPhoto} alt={request.senderName ?? 'User'} className="h-10 w-10" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{request.senderName ?? 'User'}</p>
                    {request.isNew && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">NEW</span>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">wants to connect</p>
                </div>
              </div>
              <p className="text-sm text-slate-700">{request.message}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateStatus(request.id, 'accepted')}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(request.id, 'declined')}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sent</h2>
          {sent.length === 0 && (
            <p className="text-sm text-slate-500">
              You have not sent any requests yet.
            </p>
          )}
          {sent.map((request: any) => (
            <div
              key={request.id}
              className="space-y-3 rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar src={request.receiverPhoto} alt={request.receiverName ?? 'User'} className="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{request.receiverName ?? 'User'}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">requested</p>
                </div>
              </div>
              <p className="text-sm text-slate-700">{request.message}</p>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {request.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
