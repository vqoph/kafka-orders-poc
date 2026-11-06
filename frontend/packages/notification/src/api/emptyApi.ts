import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NOTIFICATION_API_BASE_URL } from '@poc/shared';

export const NOTIFICATION_BASE_URL = NOTIFICATION_API_BASE_URL;

/** Empty API shell — endpoints are injected by OpenAPI codegen. */
export const emptySplitApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: NOTIFICATION_API_BASE_URL }),
  tagTypes: ['Notifications'],
  endpoints: () => ({}),
});
