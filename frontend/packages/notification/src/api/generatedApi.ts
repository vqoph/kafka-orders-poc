import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listNotifications: build.query<ListNotificationsApiResponse, ListNotificationsApiArg>({
      query: (queryArg) => ({
        url: `/notifications`,
        params: {
          orderId: queryArg.orderId,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type ListNotificationsApiResponse = /** status 200 OK */ NotificationEvent[];
export type ListNotificationsApiArg = {
  orderId?: string;
};
export type NotificationEvent = {
  orderId?: string;
  type?: string;
  message?: string;
  at?: string;
};
export const { useListNotificationsQuery } = injectedRtkApi;
