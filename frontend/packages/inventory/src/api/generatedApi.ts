import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStock: build.query<GetStockApiResponse, GetStockApiArg>({
      query: (queryArg) => ({ url: `/stock/${queryArg.sku}` }),
    }),
    updateStock: build.mutation<UpdateStockApiResponse, UpdateStockApiArg>({
      query: (queryArg) => ({
        url: `/stock/${queryArg.sku}`,
        method: 'PUT',
        body: queryArg.updateStockRequest,
      }),
    }),
    deleteStock: build.mutation<DeleteStockApiResponse, DeleteStockApiArg>({
      query: (queryArg) => ({ url: `/stock/${queryArg.sku}`, method: 'DELETE' }),
    }),
    getInventoryFailureRate: build.query<
      GetInventoryFailureRateApiResponse,
      GetInventoryFailureRateApiArg
    >({
      query: () => ({ url: `/chaos/failure-rate` }),
    }),
    setInventoryFailureRate: build.mutation<
      SetInventoryFailureRateApiResponse,
      SetInventoryFailureRateApiArg
    >({
      query: (queryArg) => ({
        url: `/chaos/failure-rate`,
        method: 'PUT',
        body: queryArg.failureRateRequest,
      }),
    }),
    listStock: build.query<ListStockApiResponse, ListStockApiArg>({
      query: () => ({ url: `/stock` }),
    }),
    createStock: build.mutation<CreateStockApiResponse, CreateStockApiArg>({
      query: (queryArg) => ({ url: `/stock`, method: 'POST', body: queryArg.createStockRequest }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type GetStockApiResponse = /** status 200 OK */ StockResponse;
export type GetStockApiArg = {
  sku: string;
};
export type UpdateStockApiResponse = /** status 200 OK */ StockResponse;
export type UpdateStockApiArg = {
  sku: string;
  updateStockRequest: UpdateStockRequest;
};
export type DeleteStockApiResponse = unknown;
export type DeleteStockApiArg = {
  sku: string;
};
export type GetInventoryFailureRateApiResponse = /** status 200 OK */ FailureRateResponse;
export type GetInventoryFailureRateApiArg = void;
export type SetInventoryFailureRateApiResponse = /** status 200 OK */ FailureRateResponse;
export type SetInventoryFailureRateApiArg = {
  failureRateRequest: FailureRateRequest;
};
export type ListStockApiResponse = /** status 200 OK */ StockResponse[];
export type ListStockApiArg = void;
export type CreateStockApiResponse = /** status 201 Created */ StockResponse;
export type CreateStockApiArg = {
  createStockRequest: CreateStockRequest;
};
export type StockResponse = {
  sku: string;
  quantity: number;
};
export type UpdateStockRequest = {
  quantity: number;
};
export type FailureRateResponse = {
  rate: number;
};
export type FailureRateRequest = {
  rate: number;
};
export type CreateStockRequest = {
  sku: string;
  quantity: number;
};
export const {
  useGetStockQuery,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useGetInventoryFailureRateQuery,
  useSetInventoryFailureRateMutation,
  useListStockQuery,
  useCreateStockMutation,
} = injectedRtkApi;
