import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type SuccessTextProps = HTMLAttributes<HTMLParagraphElement>;

export function SuccessText({ className, ...props }: SuccessTextProps) {
  return <p className={cn('text-sm text-success', className)} {...props} />;
}
