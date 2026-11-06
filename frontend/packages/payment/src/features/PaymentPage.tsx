import { PageShell } from '@poc/shared';
import { PaymentChaosPanel } from './chaos/PaymentChaosPanel';
import { PaymentsList } from './list/PaymentsList';

export function PaymentPage() {
  return (
    <PageShell maxWidth="lg">
      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentsList />
        <PaymentChaosPanel />
      </div>
    </PageShell>
  );
}
