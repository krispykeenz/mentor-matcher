import { MessageWindow } from '@/components/messaging/message-window';
import { requireAuth } from '@/lib/server/auth-guard';

export default async function ChatPage({ params }: { params: { matchId: string } }) {
  await requireAuth(); // Ensure user is authenticated
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <MessageWindow matchId={params.matchId} />
      </div>
    </div>
  );
}
