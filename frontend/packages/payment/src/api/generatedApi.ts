import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPaymentFailureRate: build.query<
      GetPaymentFailureRateApiResponse,
      GetPaymentFailureRateApiArg
    >({
      query: () => ({ url: `/chaos/failure-rate` }),
    }),
    setPaymentFailureRate: build.mutation<
      SetPaymentFailureRateApiResponse,
      SetPaymentFailureRateApiArg
    >({
      query: (queryArg) => ({
        url: `/chaos/failure-rate`,
        method: 'PUT',
        body: queryArg.failureRateRequest,
      }),
    }),
    listPayments: build.query<ListPaymentsApiResponse, ListPaymentsApiArg>({
      query: (queryArg) => ({
        url: `/payments`,
        params: {
          page: queryArg.page,
          size: queryArg.size,
          sort: queryArg.sort,
        },
      }),
    }),
    getPayment: build.query<GetPaymentApiResponse, GetPaymentApiArg>({
      query: (queryArg) => ({ url: `/payments/${queryArg.id}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type GetPaymentFailureRateApiResponse = /** status 200 OK */ FailureRateResponse;
export type GetPaymentFailureRateApiArg = void;
export type SetPaymentFailureRateApiResponse = /** status 200 OK */ FailureRateResponse;
export type SetPaymentFailureRateApiArg = {
  failureRateRequest: FailureRateRequest;
};
export type ListPaymentsApiResponse = /** status 200 OK */ PagedModelPaymentResponse;
export type ListPaymentsApiArg = {
  /** Zero-based page index (0..N) */
  page?: number;
  /** The size of the page to be returned */
  size?: number;
  /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
  sort?: string[];
};
export type GetPaymentApiResponse = /** status 200 OK */ PaymentResponse;
export type GetPaymentApiArg = {
  id: string;
};
export type FailureRateResponse = {
  rate: number;
};
export type FailureRateRequest = {
  rate: number;
};
export type PaymentResponse = {
  id: string;
  orderId: string;
  amount: number;
  success: boolean;
  processedAt: string;
  refundedAt?: string | null;
};
export type PageMetadata = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};
export type PagedModelPaymentResponse = {
  content: PaymentResponse[];
  page: PageMetadata;
};
export const {
  useGetPaymentFailureRateQuery,
  useSetPaymentFailureRateMutation,
  useListPaymentsQuery,
  useGetPaymentQuery,
} = injectedRtkApi;
