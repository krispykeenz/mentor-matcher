'use client';

import { useMemo } from 'react';
import { Checkbox } from './checkbox';
import { Button } from './button';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  values: string[];
  options: Option[];
  onChange: (values: string[]) => void;
}

export function MultiSelect({ values, options, onChange }: MultiSelectProps) {
  const selected = useMemo(() => new Set(values), [values]);

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(Array.from(next));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={selected.has(option.value) ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggle(option.value)}
        >
          <Checkbox checked={selected.has(option.value)} className="h-3 w-3" />
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
