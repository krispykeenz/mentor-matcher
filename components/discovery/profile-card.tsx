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
    <Card className="w-full max-w-md">
      <CardContent className="space-y-4 p-6">
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
        <p className="text-sm text-slate-700">{profile.bioShort}</p>
        <div className="flex flex-wrap gap-2">
          {profile.specialties.slice(0, 4).map((specialty) => (
            <Badge key={specialty}>{specialty}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {profile.languages.map((language) => (
            <span
              key={language}
              className="rounded-full bg-slate-100 px-3 py-1"
            >
              {language}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
