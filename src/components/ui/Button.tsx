import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'stamp';
  size?: 'sm' | 'md' | 'lg';
}

const base =
  'inline-flex items-center justify-center gap-2 font-body font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-souk-gold rounded-tag';

const variants = {
  primary: 'bg-souk-night text-souk-paper hover:bg-souk-nightlight',
  secondary: 'bg-souk-gold text-souk-ink hover:bg-souk-goldlight',
  ghost: 'bg-transparent text-souk-night border border-souk-night/20 hover:border-souk-night hover:bg-souk-night/5',
  stamp: 'bg-souk-stamp text-souk-paper hover:brightness-110',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = 'Button';
