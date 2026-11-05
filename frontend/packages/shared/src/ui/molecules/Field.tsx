import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { ErrorText } from '../atoms/ErrorText';

export type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, className, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={clsx('block space-y-1 text-sm', className)}>
      {label ? <span className="text-muted">{label}</span> : null}
      {children}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}
