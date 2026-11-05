import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export type CurrentValueCalloutProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function CurrentValueCallout({
  label,
  value,
  className,
}: CurrentValueCalloutProps) {
  return (
    <div
      className={clsx(
        'rounded-md bg-panel-muted px-3 py-2 text-sm text-foreground',
        className,
      )}
    >
      {label}: <span className="font-mono text-warning">{value}</span>
    </div>
  );
}
