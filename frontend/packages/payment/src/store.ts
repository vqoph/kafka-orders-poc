import { configureStore } from '@reduxjs/toolkit';
import { paymentApi } from './api/paymentApi';

export const store = configureStore({
  reducer: {
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paymentApi.middleware),
});
