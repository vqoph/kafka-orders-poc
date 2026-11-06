import { generatedApi } from './generatedApi';

/** Generated endpoints + cache tags (hand-tuned, not regenerated). */
export const paymentApi = generatedApi.enhanceEndpoints({
  endpoints: {
    getPaymentFailureRate: {
      providesTags: ['Chaos'],
    },
    setPaymentFailureRate: {
      invalidatesTags: ['Chaos'],
    },
    listPayments: {
      providesTags: ['Payments'],
    },
    getPayment: {
      providesTags: (_result, _error, arg) => [{ type: 'Payments', id: arg.id }],
    },
  },
});

export const {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
  useListPaymentsQuery,
  useGetPaymentQuery,
} = paymentApi;
