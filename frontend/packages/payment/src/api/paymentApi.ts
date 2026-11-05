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
  },
});

export const {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
} = paymentApi;
