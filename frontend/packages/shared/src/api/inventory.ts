import { API } from './config';
import { requestJson } from './http';
import type { ChaosFailureRate, StockItem } from '../types/api';

export function listStock(): Promise<StockItem[]> {
  return requestJson<StockItem[]>(`${API.inventory}/stock`);
}

export function getStock(sku: string): Promise<StockItem> {
  return requestJson<StockItem>(`${API.inventory}/stock/${encodeURIComponent(sku)}`);
}

export function getInventoryFailureRate(): Promise<ChaosFailureRate> {
  return requestJson<ChaosFailureRate>(`${API.inventory}/chaos/failure-rate`);
}

export function setInventoryFailureRate(rate: number): Promise<ChaosFailureRate> {
  return requestJson<ChaosFailureRate>(`${API.inventory}/chaos/failure-rate`, {
    method: 'PUT',
    body: JSON.stringify({ rate }),
  });
}
