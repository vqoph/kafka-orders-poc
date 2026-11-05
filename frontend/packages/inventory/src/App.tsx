import { Provider } from 'react-redux';
import { InventoryPage } from './features/InventoryPage';
import { store } from './store';
import './styles.css';

export default function App() {
  return (
    <Provider store={store}>
      <InventoryPage />
    </Provider>
  );
}
