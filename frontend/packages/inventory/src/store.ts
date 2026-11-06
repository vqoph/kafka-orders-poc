import { configureStore } from '@reduxjs/toolkit';
import { inventoryApi } from './api/inventoryApi';

export const store = configureStore({
  reducer: {
    [inventoryApi.reducerPath]: inventoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(inventoryApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
