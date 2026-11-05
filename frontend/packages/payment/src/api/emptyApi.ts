import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8082' }),
  tagTypes: ['Chaos'],
  endpoints: () => ({}),
});
