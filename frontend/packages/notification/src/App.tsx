import { Provider } from 'react-redux';
import { NotificationsFeed } from './features/feed/NotificationsFeed';
import { store } from './store';
import './styles.css';

export default function App() {
  return (
    <Provider store={store}>
      <NotificationsFeed />
    </Provider>
  );
}
