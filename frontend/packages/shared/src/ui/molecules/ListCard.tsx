import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type ListCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export function ListCard({
  children,
  className,
  interactive = false,
  ...props
}: ListCardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-default bg-panel px-4 py-3',
        { 'hover:border-accent': interactive },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
