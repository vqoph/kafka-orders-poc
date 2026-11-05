import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type PageShellProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
};

const maxWidthClass = {
  sm: 'mx-auto max-w-lg',
  md: 'mx-auto max-w-3xl',
  lg: 'mx-auto max-w-4xl',
  xl: 'mx-auto max-w-6xl',
  none: undefined,
};

export function PageShell({
  children,
  className,
  maxWidth = 'none',
  ...props
}: PageShellProps) {
  return (
    <div className={clsx('p-4 md:p-6', className)} {...props}>
      <div className={maxWidthClass[maxWidth]}>{children}</div>
    </div>
  );
}
