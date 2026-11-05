import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export type LoadingTextProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: string;
};

export function LoadingText({ children, className, ...props }: LoadingTextProps) {
  const { t } = useTranslation('common');
  return (
    <p className={cn('text-sm text-muted', className)} {...props}>
      {children ?? t('loading')}
    </p>
  );
}
