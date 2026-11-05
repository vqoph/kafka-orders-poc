import { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { PageShell, SidePanel } from '@poc/shared';
import { OrderCreateForm } from './features/create/OrderCreateForm';
import { OrderDetail } from './features/detail/OrderDetail';
import { OrdersList } from './features/list/OrdersList';

export default function Router() {
  const navigate = useNavigate();
  const close = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  return (
    <PageShell>
      <OrdersList />
      <Routes>
        <Route
          path="new"
          element={
            <SidePanel title="Create order" onClose={close}>
              <OrderCreateForm />
            </SidePanel>
          }
        />
        <Route
          path=":id"
          element={
            <SidePanel title="Order detail" onClose={close}>
              <OrderDetail />
            </SidePanel>
          }
        />
      </Routes>
    </PageShell>
  );
}
