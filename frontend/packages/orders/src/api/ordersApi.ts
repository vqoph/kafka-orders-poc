import { generatedApi } from './generatedApi';

/** Generated endpoints + cache tags (hand-tuned, not regenerated). */
export const ordersApi = generatedApi.enhanceEndpoints({
  endpoints: {
    listOrders: {
      providesTags: ['Orders'],
    },
    getOrder: {
      providesTags: (_result, _error, arg) => [{ type: 'Orders', id: arg.id }],
    },
    createOrder: {
      invalidatesTags: ['Orders'],
    },
  },
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
} = ordersApi;
