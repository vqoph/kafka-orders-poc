import { API } from './config';
import { requestJson } from './http';
import type { ChaosFailureRate } from '../types/api';

export function getPaymentFailureRate(): Promise<ChaosFailureRate> {
  return requestJson<ChaosFailureRate>(`${API.payment}/chaos/failure-rate`);
}

export function setPaymentFailureRate(rate: number): Promise<ChaosFailureRate> {
  return requestJson<ChaosFailureRate>(`${API.payment}/chaos/failure-rate`, {
    method: 'PUT',
    body: JSON.stringify({ rate }),
  });
}
