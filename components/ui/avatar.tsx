import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  fallback?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700',
        className,
      )}
      {...props}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="56px" />
      ) : (
        <span className="text-lg font-semibold">
          {fallback ?? alt.substring(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
