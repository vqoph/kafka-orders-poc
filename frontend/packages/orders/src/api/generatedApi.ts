import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listOrders: build.query<ListOrdersApiResponse, ListOrdersApiArg>({
      query: () => ({ url: `/orders` }),
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
export type ListOrdersApiResponse = /** status 200 OK */ OrderResponse[];
export type ListOrdersApiArg = void;
export type CreateOrderApiResponse = /** status 201 Created */ OrderResponse;
export type CreateOrderApiArg = {
  createOrderRequest: CreateOrderRequest;
};
export type RepublishApiResponse = /** status 200 OK */ {
  [key: string]: any;
};
export type RepublishApiArg = {
  id: string;
  keyMode?: 'ORDER_ID' | 'NONE';
};
export type GetOrderApiResponse = /** status 200 OK */ OrderResponse;
export type GetOrderApiArg = {
  id: string;
};
export type ItemResponse = {
  sku?: string;
  quantity?: number;
};
export type OrderResponse = {
  id?: string;
  customerId?: string;
  amount?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt?: string;
  items?: ItemResponse[];
  paymentSuccess?: boolean;
  inventorySuccess?: boolean;
};
export type OrderItemRequest = {
  sku: string;
  quantity?: number;
};
export type CreateOrderRequest = {
  customerId: string;
  items: OrderItemRequest[];
  amount: number;
};
export const {
  useListOrdersQuery,
  useCreateOrderMutation,
  useRepublishMutation,
  useGetOrderQuery,
} = injectedRtkApi;
