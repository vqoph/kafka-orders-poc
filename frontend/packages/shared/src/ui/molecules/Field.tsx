import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
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
    <label htmlFor={htmlFor} className={cn('block space-y-1 text-sm', className)}>
      {label ? <span className="text-muted">{label}</span> : null}
      {children}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}
