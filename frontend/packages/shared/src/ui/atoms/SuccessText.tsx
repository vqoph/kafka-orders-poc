import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type SuccessTextProps = HTMLAttributes<HTMLParagraphElement>;

export function SuccessText({ className, ...props }: SuccessTextProps) {
  return <p className={clsx('text-sm text-success', className)} {...props} />;
}
