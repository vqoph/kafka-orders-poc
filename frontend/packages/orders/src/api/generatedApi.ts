import { emptySplitApi as api } from './emptyApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listOrders: build.query<ListOrdersApiResponse, ListOrdersApiArg>({
      query: () => ({ url: `/orders` }),
    }),
    createOrder: build.mutation<CreateOrderApiResponse, CreateOrderApiArg>({
      query: (queryArg) => ({ url: `/orders`, method: 'POST', body: queryArg.createOrderRequest }),
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
  createdAt?: string;
  items: ItemResponse[];
  paymentSuccess?: boolean | null;
  inventorySuccess?: boolean | null;
};
export type OrderItemRequest = {
  sku: string;
  quantity: number;
};
export type CreateOrderRequest = {
  customerId: string;
  amount: number;
  items: OrderItemRequest[];
};
export const { useListOrdersQuery, useCreateOrderMutation, useGetOrderQuery } = injectedRtkApi;
