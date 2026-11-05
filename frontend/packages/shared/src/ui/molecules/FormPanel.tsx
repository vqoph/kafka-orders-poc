import type { FormHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

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
  const classes = cn(
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
