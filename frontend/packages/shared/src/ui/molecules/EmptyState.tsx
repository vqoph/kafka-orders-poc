import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type EmptyStateProps = HTMLAttributes<HTMLParagraphElement> & {
  children: string;
};

export function EmptyState({ className, ...props }: EmptyStateProps) {
  return <p className={cn('text-sm text-muted', className)} {...props} />;
}
