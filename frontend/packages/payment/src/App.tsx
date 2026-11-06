import { Provider } from 'react-redux';
import { PaymentPage } from './features/PaymentPage';
import { useInvalidateOnNotification } from './hooks/useInvalidateOnNotification';
import { store } from './store';
import './styles.css';

function SseInvalidation() {
  useInvalidateOnNotification();
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <SseInvalidation />
      <PaymentPage />
    </Provider>
  );
}
