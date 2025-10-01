"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MatchActions({ matchId, mode = 'active' }: { matchId: string; mode?: 'active' | 'archived' }) {
  const router = useRouter();
  const [working, setWorking] = useState<null | 'hide' | 'delete' | 'unhide'>(null);

  const hideMatch = async () => {
    setWorking('hide');
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hide' }),
      });
      if (res.ok) router.refresh();
    } finally {
      setWorking(null);
    }
  };

  const unhideMatch = async () => {
    setWorking('unhide');
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unhide' }),
      });
      if (res.ok) router.refresh();
    } finally {
      setWorking(null);
    }
  };

  const deleteMatch = async () => {
    const ok = window.confirm('Delete this chat for both participants? This removes all messages.');
    if (!ok) return;
    setWorking('delete');
    try {
      const res = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {mode === 'active' ? (
        <button
          type="button"
          onClick={() => void hideMatch()}
          disabled={working !== null}
          className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
        >
          {working === 'hide' ? 'Hiding…' : 'Hide'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void unhideMatch()}
          disabled={working !== null}
          className="rounded-xl border border-brand-300 px-3 py-1.5 text-xs text-brand-700 hover:bg-brand-50"
        >
          {working === 'unhide' ? 'Restoring…' : 'Unhide'}
        </button>
      )}
      <button
        type="button"
        onClick={() => void deleteMatch()}
        disabled={working !== null}
        className="rounded-xl border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
      >
        {working === 'delete' ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}
