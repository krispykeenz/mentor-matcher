import { Suspense } from 'react';
import ClientComplete from './ClientComplete';

export default function CompleteSignInPage() {
  return (
    <Suspense fallback={null}>
      <ClientComplete />
    </Suspense>
  );
}

