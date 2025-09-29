'use client';

import { useSwipeable } from 'react-swipeable';
import { useEffect, useState } from 'react';
import { ProfileCard, type DiscoveryProfile } from './profile-card';
import { Button } from '@/components/ui/button';
import { X, Star, Heart } from 'lucide-react';

interface SwipeDeckProps {
  profiles: DiscoveryProfile[];
  onLike: (profile: DiscoveryProfile) => void;
  onSkip: (profile: DiscoveryProfile) => void;
  onSave: (profile: DiscoveryProfile) => void;
}

export function SwipeDeck({ profiles, onLike, onSkip, onSave }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const profile = profiles[index];

  useEffect(() => {
    setIndex(0);
  }, [profiles]);

  const handleNext = () => setIndex((prev) => Math.min(prev + 1, profiles.length));

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (profile) {
        onSkip(profile);
        handleNext();
      }
    },
    onSwipedRight: () => {
      if (profile) {
        onLike(profile);
        handleNext();
      }
    },
    trackMouse: true,
  });

  if (!profile) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
        <p>No more profiles match your filters yet. Adjust filters or check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div {...handlers} className="touch-pan-y select-none">
        <ProfileCard profile={profile} />
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
          onClick={() => {
            onLike(profile);
            handleNext();
          }}
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
