import { Suspense } from 'react';
import ClientComplete from './ClientComplete';

export const dynamic = 'force-dynamic';

export default function CompleteSignInPage() {
  return (
    <Suspense fallback={null}>
      <ClientComplete />
    </Suspense>
  );
}

