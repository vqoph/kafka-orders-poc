import { lazy } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeSwitcher } from '@poc/shared';
import { RemoteOutlet } from './components/RemoteOutlet';

const OrdersApp = lazy(() => import('orders/App'));
const PaymentApp = lazy(() => import('payment/App'));
const InventoryApp = lazy(() => import('inventory/App'));
const NotificationApp = lazy(() => import('notification/App'));

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm transition',
    isActive
      ? 'bg-accent text-on-accent font-medium'
      : 'text-muted hover:bg-panel-muted hover:text-foreground',
  ].join(' ');

export default function App() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-default bg-panel">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Kafka Orders POC</p>
            <h1 className="text-lg font-semibold text-foreground">Microfrontend shell</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-1">
              <NavLink to="/orders" className={navClass}>
                Orders
              </NavLink>
              <NavLink to="/payment" className={navClass}>
                Payment
              </NavLink>
              <NavLink to="/inventory" className={navClass}>
                Inventory
              </NavLink>
              <NavLink to="/notifications" className={navClass}>
                Notifications
              </NavLink>
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-2 py-4 md:px-4">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route
            path="/orders/*"
            element={<RemoteOutlet name="orders" remote={OrdersApp} />}
          />
          <Route
            path="/payment/*"
            element={<RemoteOutlet name="payment" remote={PaymentApp} />}
          />
          <Route
            path="/inventory/*"
            element={<RemoteOutlet name="inventory" remote={InventoryApp} />}
          />
          <Route
            path="/notifications/*"
            element={<RemoteOutlet name="notification" remote={NotificationApp} />}
          />
          <Route
            path="*"
            element={
              <div className="p-6 text-muted">
                Unknown route. Use the navigation above.
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
