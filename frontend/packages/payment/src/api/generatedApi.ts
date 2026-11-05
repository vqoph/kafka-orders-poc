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
export type FailureRateResponse = {
  rate?: number;
};
export type FailureRateRequest = {
  rate: number;
};
export const { useGetPaymentFailureRateQuery, useSetPaymentFailureRateMutation } = injectedRtkApi;
