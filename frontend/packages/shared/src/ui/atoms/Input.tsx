import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-md border border-default bg-panel-muted px-3 py-2 text-foreground',
        className,
      )}
      {...props}
    />
  );
});
