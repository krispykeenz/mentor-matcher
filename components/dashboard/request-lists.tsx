'use client';

import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load requests');
  }
  return res.json();
};

export function RequestLists() {
  const { data, mutate } = useSWR('/api/requests', fetcher, {
    refreshInterval: 10000,
  });
  const received = data?.received ?? [];
  const sent = data?.sent ?? [];

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    const response = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      toast.success(`Request ${status}`);
      mutate();
    } else {
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
