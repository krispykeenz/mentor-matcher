'use client';

import { useState } from 'react';
import { SwipeDeck } from '@/components/discovery/swipe-deck';
import type { DiscoveryProfile } from '@/components/discovery/profile-card';
import { toast } from 'sonner';
import { FiltersDrawer } from '@/components/discovery/filters-drawer';
import type { DiscoveryFilters } from '@/components/discovery/filters-drawer';

interface DiscoveryShellProps {
  initialProfiles: DiscoveryProfile[];
}

export function DiscoveryShell({ initialProfiles }: DiscoveryShellProps) {
  const [profiles, setProfiles] = useState(initialProfiles);

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
    const response = await fetch(query ? `/api/discovery?${query}` : '/api/discovery');
    const data = await response.json();
    setProfiles(data.profiles ?? []);
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

  const handleLike = async (profile: DiscoveryProfile) => {
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverUserId: profile.id, message: 'Hi! I would love to connect.', goals: ['General support'] }),
    });
    if (response.ok) {
      toast.success('Mentorship request sent');
    } else {
      toast.error('Could not send request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Discover matches</h1>
          <p className="text-sm text-slate-600">Swipe right to request mentorship, left to skip, star to bookmark.</p>
        </div>
        <FiltersDrawer onFilterChange={handleFilters} />
      </div>
      <SwipeDeck profiles={profiles} onLike={handleLike} onSkip={handleSkip} onSave={handleSave} />
    </div>
  );
}
