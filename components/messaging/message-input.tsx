'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/auth-context';

export function MessageInput({
  onSend,
  disabled,
  mePhotoUrl,
}: {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
  mePhotoUrl?: string | null;
}) {
  const [value, setValue] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    await onSend(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <Avatar src={mePhotoUrl ?? null} alt={user?.email ?? 'You'} className="h-8 w-8" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type a message"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
}
