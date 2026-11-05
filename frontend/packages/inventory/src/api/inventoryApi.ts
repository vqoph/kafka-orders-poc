import { generatedApi } from './generatedApi';

/** Generated endpoints + cache tags (hand-tuned, not regenerated). */
export const inventoryApi = generatedApi.enhanceEndpoints({
  endpoints: {
    listStock: {
      providesTags: ['Stock'],
    },
    getInventoryFailureRate: {
      providesTags: ['Chaos'],
    },
    setInventoryFailureRate: {
      invalidatesTags: ['Chaos'],
    },
  },
});

export const {
  useListStockQuery,
  useGetInventoryFailureRateQuery,
  useSetInventoryFailureRateMutation,
} = inventoryApi;
