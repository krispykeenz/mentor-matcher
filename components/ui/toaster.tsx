'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl border border-slate-100 shadow-soft bg-white text-slate-900',
        },
      }}
    />
  );
}
