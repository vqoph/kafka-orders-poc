import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listOrders: build.query<ListOrdersApiResponse, ListOrdersApiArg>({
      query: (queryArg) => ({
        url: `/orders`,
        params: {
          page: queryArg.page,
          size: queryArg.size,
          sort: queryArg.sort,
        },
      }),
    }),
    createOrder: build.mutation<CreateOrderApiResponse, CreateOrderApiArg>({
      query: (queryArg) => ({ url: `/orders`, method: 'POST', body: queryArg.createOrderRequest }),
    }),
    republish: build.mutation<RepublishApiResponse, RepublishApiArg>({
      query: (queryArg) => ({
        url: `/labs/kafka/orders/${queryArg.id}/republish`,
        method: 'POST',
        params: {
          keyMode: queryArg.keyMode,
        },
      }),
    }),
    getOrder: build.query<GetOrderApiResponse, GetOrderApiArg>({
      query: (queryArg) => ({ url: `/orders/${queryArg.id}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type ListOrdersApiResponse = /** status 200 OK */ PagedModelOrderResponse;
export type ListOrdersApiArg = {
  /** Zero-based page index (0..N) */
  page?: number;
  /** The size of the page to be returned */
  size?: number;
  /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
  sort?: string[];
};
export type CreateOrderApiResponse = /** status 201 Created */ OrderResponse;
export type CreateOrderApiArg = {
  createOrderRequest: CreateOrderRequest;
};
export type RepublishApiResponse = /** status 200 OK */ RepublishResponse;
export type RepublishApiArg = {
  id: string;
  keyMode?: 'ORDER_ID' | 'NONE';
};
export type GetOrderApiResponse = /** status 200 OK */ OrderResponse;
export type GetOrderApiArg = {
  id: string;
};
export type ItemResponse = {
  sku: string;
  quantity: number;
};
export type OrderResponse = {
  id: string;
  customerId: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  items: ItemResponse[];
  paymentSuccess?: boolean | null;
  inventorySuccess?: boolean | null;
  errorMessage?: string | null;
};
export type PageMetadata = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};
export type PagedModelOrderResponse = {
  content: OrderResponse[];
  page: PageMetadata;
};
export type OrderItemRequest = {
  sku: string;
  quantity: number;
};
export type CreateOrderRequest = {
  customerId: string;
  items: OrderItemRequest[];
  amount: number;
};
export type RepublishResponse = {
  topic: string;
  keyMode: string;
  key: string;
  order: OrderResponse;
};
export const {
  useListOrdersQuery,
  useCreateOrderMutation,
  useRepublishMutation,
  useGetOrderQuery,
} = injectedRtkApi;
