import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

export type LoadingTextProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: string;
};

export function LoadingText({ children, className, ...props }: LoadingTextProps) {
  const { t } = useTranslation('common');
  return (
    <p className={clsx('text-sm text-muted', className)} {...props}>
      {children ?? t('loading')}
    </p>
  );
}
