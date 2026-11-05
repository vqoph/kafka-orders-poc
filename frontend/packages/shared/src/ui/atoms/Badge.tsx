import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type BadgeTone = 'neutral' | 'success' | 'danger' | 'accent';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  pill?: boolean;
};

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-panel-muted text-muted',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  accent: 'bg-accent/15 text-accent',
};

export function Badge({
  tone = 'neutral',
  pill = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        // layout / typography
        'inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        // shape
        {
          'rounded-full px-3 py-1 normal-case tracking-normal': pill,
          rounded: !pill,
        },
        // tone
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
