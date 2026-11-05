import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'warning' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-accent font-medium hover:bg-accent-strong disabled:opacity-60',
  secondary:
    'border border-default text-foreground hover:border-accent disabled:opacity-60',
  warning:
    'bg-warning text-on-accent font-medium hover:opacity-90 disabled:opacity-60',
  ghost: 'text-sm text-accent hover:text-accent-strong disabled:opacity-60',
  danger:
    'border border-danger/50 text-danger hover:bg-danger/10 disabled:opacity-60',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-sm',
};

export function buttonClassName(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    variant === 'ghost'
      ? 'inline-flex items-center'
      : 'inline-flex items-center justify-center rounded-md transition',
    variantClass[variant],
    variant === 'ghost' ? undefined : sizeClass[size],
    className,
  );
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, size, className)} {...props} />;
}
