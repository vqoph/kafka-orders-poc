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
  orderId?: string | null;
  type: string;
  message: string;
  /** Outcome when applicable (null for CONNECTED / unknown) */
  success?: boolean | null;
  at: string;
};
export const { useListNotificationsQuery } = injectedRtkApi;
