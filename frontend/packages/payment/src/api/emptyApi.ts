import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PAYMENT_API_BASE_URL } from '@poc/shared';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({ baseUrl: PAYMENT_API_BASE_URL }),
  tagTypes: ['Chaos', 'Payments'],
  endpoints: () => ({}),
});
