import { generatedApi } from './generatedApi';

/** Generated endpoints + cache tags (hand-tuned, not regenerated). */
export const inventoryApi = generatedApi.enhanceEndpoints({
  endpoints: {
    listStock: {
      providesTags: ['Stock'],
    },
    getStock: {
      providesTags: (_result, _error, arg) => [{ type: 'Stock', id: arg.sku }],
    },
    createStock: {
      invalidatesTags: ['Stock'],
    },
    updateStock: {
      invalidatesTags: ['Stock'],
    },
    deleteStock: {
      invalidatesTags: ['Stock'],
    },
  },
});

export const {
  useListStockQuery,
  useGetStockQuery,
  useCreateStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
} = inventoryApi;
