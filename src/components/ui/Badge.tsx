import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-souk-gold/20 px-2.5 py-0.5 font-mono text-[11px] font-medium text-souk-night',
        className
      )}
      {...props}
    />
  );
}
