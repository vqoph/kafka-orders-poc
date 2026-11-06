import { Provider } from 'react-redux';
import { PaymentPage } from './features/PaymentPage';
import { store } from './store';
import './styles.css';

export default function App() {
  return (
    <Provider store={store}>
      <PaymentPage />
    </Provider>
  );
}
