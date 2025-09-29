import { cn } from '@/lib/utils/cn';

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div className={cn('h-2 rounded-full bg-brand-500 transition-all')} style={{ width: `${value}%` }} />
    </div>
  );
}
