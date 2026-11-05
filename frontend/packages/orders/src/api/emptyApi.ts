import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8081' }),
  tagTypes: ['Orders'],
  endpoints: () => ({}),
});
