'use client';

import React, { useEffect, useState } from 'react';
import { SwipeDeck } from '@/components/discovery/swipe-deck';
import type { DiscoveryProfile } from '@/components/discovery/profile-card';
import { toast } from 'sonner';
import { FiltersDrawer } from '@/components/discovery/filters-drawer';
import type { DiscoveryFilters } from '@/components/discovery/filters-drawer';
import { QuickFiltersPanel, type QuickFilters } from '@/components/discovery/quick-filters-panel';
import { HighlightsPanel } from '@/components/discovery/highlights-panel';

interface DiscoveryShellProps {
  initialProfiles: DiscoveryProfile[];
}

export function DiscoveryShell({ initialProfiles }: DiscoveryShellProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [active, setActive] = useState<DiscoveryProfile | null>(null);
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({});
  const [viewer, setViewer] = useState<any | null>(null);

  const refresh = async (filters?: DiscoveryFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, String(item)));
        } else if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString();
    const response = await fetch(
      query ? `/api/discovery?${query}` : '/api/discovery',
    );
    const data = await response.json();
    setProfiles(data.profiles ?? []);
  };

  // Fetch viewer profile on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!cancelled && res.ok) {
          const data = await res.json();
          setViewer((data?.profile as any) ?? null);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const applyQuickFilters = (next: QuickFilters) => {
    setQuickFilters(next);
    refresh(next as DiscoveryFilters);
  };

  const handleFilters = (filters: DiscoveryFilters) => {
    refresh(filters);
  };

  const handleSkip = (profile: DiscoveryProfile) => {
    toast('Skipped', { description: `You skipped ${profile.fullName}` });
  };

  const handleSave = async (profile: DiscoveryProfile) => {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: profile.id }),
    });
    toast.success('Profile saved');
  };

  const handleLike = async (_profile: DiscoveryProfile) => {
    // Request is sent from SwipeDeck after composing a message.
    toast.success('Mentorship request sent');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Discover matches
          </h1>
          <p className="text-sm text-slate-600">
            Swipe right to request mentorship, left to skip, star to bookmark.
          </p>
        </div>
        <FiltersDrawer onFilterChange={handleFilters} />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SwipeDeck
          profiles={profiles}
          onLike={handleLike}
          onSkip={handleSkip}
          onSave={handleSave}
          onActiveChange={(p) => setActive(p)}
        />
        <div className="sticky top-20 hidden h-fit space-y-4 self-start lg:block">
          <QuickFiltersPanel value={quickFilters} onChange={applyQuickFilters} />
          <HighlightsPanel active={active} viewer={viewer} />
        </div>
      </div>
    </div>
  );
}
