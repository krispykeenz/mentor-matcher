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
    <div className="relative h-full w-full max-w-sm rounded-2xl bg-gradient-to-br from-brand-100/70 via-white to-sand-100/70 p-[1.5px] md:max-w-md xl:max-w-2xl">
      <Card className="h-full w-full rounded-[1.2rem]">
        {/* On xl screens, use a split layout with a large photo */}
        <CardContent className="h-full p-0 xl:grid xl:grid-cols-[1.05fr_1.3fr] xl:gap-0">
          <div className="flex h-full flex-col gap-3 p-4 md:gap-4 md:p-6 xl:p-8">
            <div className="flex items-center gap-3">
              <Avatar src={profile.photoUrl} alt={profile.fullName} className="h-10 w-10 md:h-12 md:w-12" />
              <div className="space-y-0.5 md:space-y-1">
                <h3 className="text-base font-semibold text-slate-900 md:text-lg">
                  {profile.fullName}
                </h3>
                <p className="text-xs text-slate-500 md:text-sm">
                  {profile.occupation} · {profile.province}
                </p>
              </div>
            </div>
            <p className="overflow-hidden text-xs text-slate-700 md:text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{profile.bioShort}</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {profile.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} className="text-xs px-2 py-0.5">{specialty}</Badge>
              ))}
              {profile.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">+{profile.specialties.length - 3}</Badge>
              )}
            </div>
            <div className="mt-auto flex flex-wrap gap-1.5 text-xs text-slate-500">
              {profile.languages.slice(0, 2).map((language) => (
                <span
                  key={language}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                >
                  {language}
                </span>
              ))}
              {profile.languages.length > 2 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                  +{profile.languages.length - 2}
                </span>
              )}
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
