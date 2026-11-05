import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'rounded-md border border-default bg-panel-muted px-2 py-1.5 text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
