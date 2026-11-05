import { Provider } from 'react-redux';
import { PaymentChaosPage } from './features/chaos/PaymentChaosPage';
import { store } from './store';
import './styles.css';

export default function App() {
  return (
    <Provider store={store}>
      <PaymentChaosPage />
    </Provider>
  );
}
