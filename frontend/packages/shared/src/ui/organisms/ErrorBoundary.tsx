import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../atoms/Button';

type ErrorBoundaryProps = {
  name: string;
  children: ReactNode;
};

type InnerProps = ErrorBoundaryProps & {
  t: (key: string, options?: Record<string, unknown>) => string;
};

type State = {
  error: Error | null;
};

class ErrorBoundaryInner extends Component<InnerProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[shared] remote "${this.props.name}" failed`, error, info);
  }

  render() {
    const { t } = this.props;
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-danger">
          <h2 className="text-lg font-semibold">
            {t('errorBoundary.title', { name: this.props.name })}
          </h2>
          <p className="mt-2 text-sm opacity-90">
            {t('errorBoundary.hint', { details: this.state.error.message })}
          </p>
          <Button
            variant="danger"
            className="mt-4"
            onClick={() => this.setState({ error: null })}
          >
            {t('retry')}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const { t } = useTranslation('common');
  return <ErrorBoundaryInner {...props} t={t} />;
}
