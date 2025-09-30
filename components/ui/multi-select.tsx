'use client';

import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils/cn';

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
      {options.map((option) => {
        const isSelected = selected.has(option.value);
        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggle(option.value)}
            aria-pressed={isSelected}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-3 w-3 items-center justify-center rounded-[4px] border border-slate-300 bg-white text-transparent',
                  isSelected && 'border-brand-500 bg-brand-500 text-white',
                )}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
              <span>{option.label}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
