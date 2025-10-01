'use client';

import { useSwipeable } from 'react-swipeable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProfileCard, type DiscoveryProfile } from './profile-card';
import { Button } from '@/components/ui/button';
import { X, Star, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface SwipeDeckProps {
  profiles: DiscoveryProfile[];
  onLike: (profile: DiscoveryProfile) => void; // called after sending request successfully
  onSkip: (profile: DiscoveryProfile) => void;
  onSave: (profile: DiscoveryProfile) => void;
  onActiveChange?: (profile: DiscoveryProfile | null, index: number) => void;
}

export function SwipeDeck({
  profiles,
  onLike,
  onSkip,
  onSave,
  onActiveChange,
}: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const profile = profiles[index];

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState("Hi! I'd love to connect and learn more about your experience.");

  useEffect(() => {
    setIndex(0);
  }, [profiles]);

  useEffect(() => {
    onActiveChange?.(profile ?? null, index);
  }, [profile, index, onActiveChange]);

  const handleNext = useCallback(() => {
    setIndex((prevI) => Math.min(prevI + 1, profiles.length));
  }, [profiles.length]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (profile) {
        onSkip(profile);
        handleNext();
      }
    },
    onSwipedRight: () => {
      if (profile) {
        setComposeOpen(true);
      }
    },
    trackMouse: true,
  });

  const sendRequest = useCallback(async () => {
    if (!profile) return;
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUserId: profile.id, message, goals: ['General support'] }),
      });
      if (res.ok) {
        onLike(profile);
        setComposeOpen(false);
        setMessage("Hi! I'd love to connect and learn more about your experience.");
        handleNext();
      }
    } catch {}
  }, [message, profile, onLike, handleNext]);

  if (!profile) {
    return (
      <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(340px_140px_at_50%_0,rgba(29,111,255,0.08),transparent)]" />
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
          alt="Friendly home interior"
          className="mb-4 h-28 w-28 rounded-2xl object-cover shadow-soft"
          loading="lazy"
        />
        <p className="max-w-md">
          No more profiles match your filters yet. Adjust filters or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div {...handlers} className="relative h-[520px] touch-pan-y select-none md:h-[560px] xl:h-[620px]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(640px_200px_at_50%_0,rgba(29,111,255,0.08),transparent)]" />

        <div key={profile.id} className="h-full animate-fade-slide" onClick={() => setDetailsOpen(true)}>
          <ProfileCard profile={profile} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button
          aria-label="Skip"
          variant="outline"
          size="icon"
          onClick={() => {
            onSkip(profile);
            handleNext();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
        <Button
          aria-label="Save"
          variant="ghost"
          size="icon"
          onClick={() => {
            onSave(profile);
          }}
        >
          <Star className="h-5 w-5" />
        </Button>
        <Button
          aria-label="Like"
          size="icon"
          onClick={() => setComposeOpen(true)}
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      {/* Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetHeader>
            <SheetTitle>{profile.fullName}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto p-1">
            {profile.photoUrl && (
              <img src={profile.photoUrl} alt={profile.fullName} className="h-56 w-full rounded-2xl object-cover shadow-soft" />
            )}
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div><span className="font-medium">Occupation:</span> {profile.occupation}</div>
              <div><span className="font-medium">Province:</span> {profile.province}</div>
            </div>
            <p className="text-sm text-slate-700">{profile.bioShort}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={() => { onSave(profile); }}>Save</Button>
              <Button variant="ghost" onClick={() => { onSkip(profile); handleNext(); setDetailsOpen(false); }}>Hide</Button>
              <Button onClick={() => { setDetailsOpen(false); setComposeOpen(true); }}>Connect</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Compose Request */}
      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent side="bottom" className="w-full max-w-xl">
          <SheetHeader>
            <SheetTitle>Send a personal message</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-1">
            <textarea
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a short introduction and what you'd like help with"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button onClick={() => void sendRequest()}>Send request</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
