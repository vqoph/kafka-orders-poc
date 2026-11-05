import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type LoadingTextProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: string;
};

export function LoadingText({
  children = 'Loading…',
  className,
  ...props
}: LoadingTextProps) {
  return (
    <p className={cn('text-sm text-muted', className)} {...props}>
      {children}
    </p>
  );
}
