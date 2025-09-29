import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'soft';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        {
          default: 'bg-brand-100 text-brand-700',
          outline: 'border border-brand-200 text-brand-700',
          soft: 'bg-slate-100 text-slate-700',
        }[variant],
        className,
      )}
      {...props}
    />
  );
}
