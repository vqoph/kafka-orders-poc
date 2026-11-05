import { generatedApi } from './generatedApi';

/** Generated endpoints + cache tags (hand-tuned, not regenerated). */
export const notificationApi = generatedApi.enhanceEndpoints({
  endpoints: {
    listNotifications: {
      providesTags: ['Notifications'],
    },
  },
});

export const { useListNotificationsQuery } = notificationApi;
export type { NotificationEvent } from './generatedApi';
