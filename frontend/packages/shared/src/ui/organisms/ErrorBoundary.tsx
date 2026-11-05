import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../atoms/Button';

type Props = {
  name: string;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[shared] remote "${this.props.name}" failed`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-danger">
          <h2 className="text-lg font-semibold">Remote unavailable: {this.props.name}</h2>
          <p className="mt-2 text-sm opacity-90">
            Start the remote webpack server and refresh. Details: {this.state.error.message}
          </p>
          <Button
            variant="danger"
            className="mt-4"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
