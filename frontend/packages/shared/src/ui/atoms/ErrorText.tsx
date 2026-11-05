import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type ErrorTextProps = HTMLAttributes<HTMLParagraphElement>;

export function ErrorText({ className, ...props }: ErrorTextProps) {
  return <p className={cn('text-sm text-danger', className)} {...props} />;
}
