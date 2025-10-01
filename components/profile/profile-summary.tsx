import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export function ProfileSummary({ profile }: { profile: any }) {
  if (!profile) {
    return (
      <p className="text-sm text-slate-500">
        Complete onboarding to publish your profile.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4">
        <Avatar src={profile.photoUrl} alt={profile.fullName ?? 'Profile'} className="h-16 w-16" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">{profile.fullName}</h2>
          <p className="text-sm text-slate-600">{profile.bioShort}</p>
        </div>
        <div>
          <a href="/profile/edit" className="text-sm font-medium text-brand-700 underline">
            Change photo
          </a>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Role
            </p>
            <p className="text-sm text-slate-800">{profile.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Location
            </p>
            <p className="text-sm text-slate-800">
              {profile.city}, {profile.province}
            </p>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {profile.specialties?.map((specialty: string) => (
            <Badge key={specialty}>{specialty}</Badge>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {profile.languages?.map((language: string) => (
            <Badge key={language} variant="soft">
              {language}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
