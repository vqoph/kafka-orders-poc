import { describe, expect, it, vi, afterEach } from 'vitest';
import { ApiError, requestJson } from './http';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestJson', () => {
  it('returns parsed json on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: '1' }),
      }),
    );

    await expect(requestJson<{ id: string }>('/api')).resolves.toEqual({ id: '1' });
  });

  it('throws ApiError on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: async () => 'boom',
      }),
    );

    await expect(requestJson('/api')).rejects.toBeInstanceOf(ApiError);
  });
});
