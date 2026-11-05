import i18n from 'i18next';

export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const err = error as { status?: number | string; data?: unknown };
    if (typeof err.data === 'string' && err.data) return err.data;
    if (err.status != null) {
      return i18n.t('common:requestFailed', { status: err.status });
    }
  }
  return fallback;
}
