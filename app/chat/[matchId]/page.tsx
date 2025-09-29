import { MessageWindow } from '@/components/messaging/message-window';

export default function ChatPage({ params }: { params: { matchId: string } }) {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <MessageWindow matchId={params.matchId} />
      </div>
    </div>
  );
}
