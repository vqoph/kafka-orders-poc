import { API } from './config';
import { requestJson } from './http';
import type { CreateOrderRequest, OrderResponse } from '../types/api';

export function listOrders(): Promise<OrderResponse[]> {
  return requestJson<OrderResponse[]>(`${API.order}/orders`);
}

export function getOrder(id: string): Promise<OrderResponse> {
  return requestJson<OrderResponse>(`${API.order}/orders/${encodeURIComponent(id)}`);
}

export function createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
  return requestJson<OrderResponse>(`${API.order}/orders`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
