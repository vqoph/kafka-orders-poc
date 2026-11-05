import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type EmptyStateProps = HTMLAttributes<HTMLParagraphElement> & {
  children: string;
};

export function EmptyState({ className, ...props }: EmptyStateProps) {
  return <p className={clsx('text-sm text-muted', className)} {...props} />;
}
