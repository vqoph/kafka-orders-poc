import { Provider } from 'react-redux';
import Router from './Router';
import { store } from './store';
import './styles.css';

export default function App() {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}
