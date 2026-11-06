import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type StockResponse = {
  sku: string;
  quantity: number;
};

/**
 * Minimal inventory client for order create (product Select).
 * Front-only — order-service does not validate the catalog.
 */
export const inventoryStockApi = createApi({
  reducerPath: 'inventoryStockApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8085' }),
  endpoints: (build) => ({
    listStockForOrders: build.query<StockResponse[], void>({
      query: () => ({ url: '/stock' }),
    }),
  }),
});

export const { useListStockForOrdersQuery } = inventoryStockApi;
