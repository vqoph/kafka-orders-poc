import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { INVENTORY_API_BASE_URL } from '@poc/shared';

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
  baseQuery: fetchBaseQuery({ baseUrl: INVENTORY_API_BASE_URL }),
  tagTypes: ['Stock'],
  endpoints: (build) => ({
    listStockForOrders: build.query<StockResponse[], void>({
      query: () => ({ url: '/stock' }),
      providesTags: ['Stock'],
    }),
  }),
});

export const { useListStockForOrdersQuery } = inventoryStockApi;
