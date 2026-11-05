import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type ErrorTextProps = HTMLAttributes<HTMLParagraphElement>;

export function ErrorText({ className, ...props }: ErrorTextProps) {
  return <p className={clsx('text-sm text-danger', className)} {...props} />;
}
