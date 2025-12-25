import { MessageWindow } from '@/components/messaging/message-window';

// Static export on GitHub Pages needs concrete params for dynamic routes.
export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return [{ matchId: 'demo-match-1' }];
  }
  return [];
}

export default function ChatPage({ params }: { params: { matchId: string } }) {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <MessageWindow matchId={params.matchId} />
      </div>
    </div>
  );
}
