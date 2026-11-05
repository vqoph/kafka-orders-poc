import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground',
        className,
      )}
      {...props}
    />
  );
}
