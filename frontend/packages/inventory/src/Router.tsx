import { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { PageShell, SidePanel, useTranslation } from '@poc/shared';
import { StockForm } from './features/stock/StockForm';
import { StockList } from './features/stock/StockList';

export default function Router() {
  const navigate = useNavigate();
  const { t } = useTranslation('inventory');
  const close = useCallback(() => {
    navigate('/inventory');
  }, [navigate]);

  return (
    <PageShell>
      <StockList />
      <Routes>
        <Route
          path="new"
          element={
            <SidePanel title={t('createTitle')} onClose={close}>
              <StockForm mode="create" />
            </SidePanel>
          }
        />
        <Route
          path="edit/:sku"
          element={
            <SidePanel title={t('editTitle')} onClose={close}>
              <StockForm mode="edit" />
            </SidePanel>
          }
        />
      </Routes>
    </PageShell>
  );
}
