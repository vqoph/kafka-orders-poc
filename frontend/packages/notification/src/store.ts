import { configureStore } from '@reduxjs/toolkit';
import { notificationApi } from './api/notificationApi';

export const store = configureStore({
  reducer: {
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
