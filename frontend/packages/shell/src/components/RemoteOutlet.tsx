import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { ErrorBoundary } from '@poc/shared';

type Props = {
  name: string;
  remote: LazyExoticComponent<ComponentType>;
};

export function RemoteOutlet({ name, remote: Remote }: Props) {
  return (
    <ErrorBoundary name={name}>
      <Suspense
        fallback={
          <div className="rounded-xl border border-default bg-panel p-6 text-muted">
            Loading {name}…
          </div>
        }
      >
        <Remote />
      </Suspense>
    </ErrorBoundary>
  );
}
