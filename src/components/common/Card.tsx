import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
}

export function Card({
  highlighted = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={
        `bg-surface rounded-lg shadow-soft p-6 border-2 ` +
        `${highlighted ? 'border-primary shadow-lift' : 'border-transparent'} ` +
        className
      }
      {...props}
    />
  );
}
