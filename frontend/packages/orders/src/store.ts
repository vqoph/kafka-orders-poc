import { configureStore } from '@reduxjs/toolkit';
import { inventoryStockApi } from './api/inventoryStockApi';
import { ordersApi } from './api/ordersApi';

export const store = configureStore({
  reducer: {
    [ordersApi.reducerPath]: ordersApi.reducer,
    [inventoryStockApi.reducerPath]: inventoryStockApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(ordersApi.middleware)
      .concat(inventoryStockApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
