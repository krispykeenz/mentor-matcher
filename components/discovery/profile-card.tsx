'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

export interface DiscoveryProfile {
  id: string;
  fullName: string;
  role: string;
  occupation: string;
  province: string;
  city?: string;
  specialties: string[];
  languages: string[];
  bioShort: string;
  photoUrl?: string;
}

interface Props {
  profile: DiscoveryProfile;
}

export function ProfileCard({ profile }: Props) {
  return (
<div className="relative h-full w-full max-w-md rounded-[1.25rem] bg-gradient-to-br from-brand-100/70 via-white to-sand-100/70 p-[1.5px] md:max-w-2xl xl:max-w-3xl">
      <Card className="h-full w-full rounded-[1.2rem]">
        {/* On xl screens, use a split layout with a large photo */}
<CardContent className="h-full p-0 xl:grid xl:grid-cols-[1.05fr_1.3fr] xl:gap-0">
          <div className="flex h-full flex-col gap-4 p-6 xl:p-8">
            <div className="flex items-center gap-3">
              <Avatar src={profile.photoUrl} alt={profile.fullName} />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {profile.fullName}
                </h3>
                <p className="text-sm text-slate-500">
                  {profile.occupation} · {profile.province}
                </p>
              </div>
            </div>
            <p className="max-h-20 overflow-hidden text-sm text-slate-700">{profile.bioShort}</p>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.slice(0, 4).map((specialty) => (
                <Badge key={specialty}>{specialty}</Badge>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-2 text-xs text-slate-500">
              {profile.languages.map((language) => (
                <span
                  key={language}
                  className="rounded-full bg-slate-100 px-3 py-1"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
          <div className="relative hidden h-full overflow-hidden rounded-br-[1.2rem] rounded-tr-[1.2rem] xl:block">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
className="absolute inset-0 h-full w-full object-cover object-center xl:object-[50%_35%]"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-sand-100 to-brand-100/60" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
