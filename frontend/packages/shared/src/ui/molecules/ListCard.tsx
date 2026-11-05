import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

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
      className={cn(
        'rounded-lg border border-default bg-panel px-4 py-3',
        interactive && 'hover:border-accent',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
