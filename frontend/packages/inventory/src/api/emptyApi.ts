import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { INVENTORY_API_BASE_URL } from '@poc/shared';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: INVENTORY_API_BASE_URL }),
  tagTypes: ['Stock'],
  endpoints: () => ({}),
});
