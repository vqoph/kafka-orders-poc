import type { FormHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type FormPanelProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  asDiv?: boolean;
};

export function FormPanel({
  children,
  className,
  asDiv = false,
  ...props
}: FormPanelProps) {
  const classes = clsx(
    'space-y-4 rounded-xl border border-default bg-panel p-4',
    className,
  );

  if (asDiv) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <form className={classes} {...props}>
      {children}
    </form>
  );
}
