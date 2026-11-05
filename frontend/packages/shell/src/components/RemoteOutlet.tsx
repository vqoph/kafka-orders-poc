import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { ErrorBoundary, useTranslation } from '@poc/shared';

type Props = {
  name: string;
  remote: LazyExoticComponent<ComponentType>;
};

export function RemoteOutlet({ name, remote: Remote }: Props) {
  const { t } = useTranslation('shell');

  return (
    <ErrorBoundary name={name}>
      <Suspense
        fallback={
          <div className="rounded-xl border border-default bg-panel p-6 text-muted">
            {t('loadingRemote', { name })}
          </div>
        }
      >
        <Remote />
      </Suspense>
    </ErrorBoundary>
  );
}
