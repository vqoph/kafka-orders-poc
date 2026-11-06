import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ORDERS_API_BASE_URL } from '@poc/shared';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({ baseUrl: ORDERS_API_BASE_URL }),
  tagTypes: ['Orders'],
  endpoints: () => ({}),
});
