'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    await onSend(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
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
