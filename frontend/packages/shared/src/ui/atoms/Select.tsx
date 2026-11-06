import { forwardRef, type SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={clsx(
        'rounded-md border border-default bg-panel-muted px-2 py-1.5 text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
