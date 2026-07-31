import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-tag border border-souk-ink/15 bg-white px-3.5 py-2.5 text-sm text-souk-ink placeholder:text-souk-ink/40 outline-none transition focus:border-souk-night focus:ring-2 focus:ring-souk-night/10',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
