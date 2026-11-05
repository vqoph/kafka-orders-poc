import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8085' }),
  tagTypes: ['Stock', 'Chaos'],
  endpoints: () => ({}),
});
