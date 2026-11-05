export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'RESERVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | string;

export interface OrderItem {
  sku: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
}

export interface OrderResponse {
  id: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount?: number;
  paymentSuccess?: boolean | null;
  inventorySuccess?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChaosFailureRate {
  rate: number;
}

export interface StockItem {
  sku: string;
  quantity: number;
  reserved?: number;
}

export interface NotificationMessage {
  id?: string;
  orderId: string;
  type?: string;
  message: string;
  timestamp?: string;
  status?: string;
}
