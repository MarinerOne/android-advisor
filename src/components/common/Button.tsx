import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  'inline-flex items-center justify-center gap-2 font-body font-bold rounded-pill px-6 py-3 ' +
  'transition-all duration-fast focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed ' +
  'active:scale-[0.97]';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-ink shadow-soft hover:shadow-lift hover:-translate-y-0.5',
  secondary:
    'bg-surface text-ink border-2 border-border hover:border-primary hover:-translate-y-0.5',
  ghost: 'bg-transparent text-ink-soft hover:text-ink hover:bg-surface-alt',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
