import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={clsx(
        'flex flex-wrap items-end justify-between gap-3',
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
