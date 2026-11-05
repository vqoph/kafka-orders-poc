import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const NOTIFICATION_BASE_URL = 'http://localhost:8084';

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: NOTIFICATION_BASE_URL }),
  tagTypes: ['Notifications'],
  endpoints: () => ({}),
});
