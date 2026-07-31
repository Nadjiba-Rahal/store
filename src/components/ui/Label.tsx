import { cn } from '@/lib/utils';
import { type LabelHTMLAttributes } from 'react';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-souk-ink/60', className)}
      {...props}
    />
  );
}
