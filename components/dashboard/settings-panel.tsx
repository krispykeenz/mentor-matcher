import { getCurrentUserProfile } from '@/lib/server/profile-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export async function SettingsPanel() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Push notifications
            </h2>
            <p className="text-sm text-slate-500">
              Receive updates when you get a new request or message.
            </p>
          </div>
          <Switch defaultChecked={profile?.notifications?.push ?? true} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Email summaries
            </h2>
            <p className="text-sm text-slate-500">
              Send me a weekly summary of mentorship activity.
            </p>
          </div>
          <Switch defaultChecked={profile?.notifications?.email ?? true} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Account controls
          </h2>
          <p className="text-sm text-slate-500">
            You can request account deletion by emailing
            privacy@mentormatchsa.org. We will remove personal data within 14
            days.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
