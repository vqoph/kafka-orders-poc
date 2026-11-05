import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listStock: build.query<ListStockApiResponse, ListStockApiArg>({
      query: () => ({ url: `/stock` }),
    }),
    getStock: build.query<GetStockApiResponse, GetStockApiArg>({
      query: (queryArg) => ({ url: `/stock/${queryArg.sku}` }),
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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type ListStockApiResponse = /** status 200 OK */ StockResponse[];
export type ListStockApiArg = void;
export type GetStockApiResponse = /** status 200 OK */ StockResponse;
export type GetStockApiArg = {
  sku: string;
};
export type GetInventoryFailureRateApiResponse = /** status 200 OK */ FailureRateResponse;
export type GetInventoryFailureRateApiArg = void;
export type SetInventoryFailureRateApiResponse = /** status 200 OK */ FailureRateResponse;
export type SetInventoryFailureRateApiArg = {
  failureRateRequest: FailureRateRequest;
};
export type StockResponse = {
  sku: string;
  quantity: number;
};
export type FailureRateResponse = {
  rate: number;
};
export type FailureRateRequest = {
  rate: number;
};
export const {
  useListStockQuery,
  useGetStockQuery,
  useGetInventoryFailureRateQuery,
  useSetInventoryFailureRateMutation,
} = injectedRtkApi;
