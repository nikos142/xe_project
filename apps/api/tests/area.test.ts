import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// In-memory replacement for Redis, shared between the mock and the tests
const cache = vi.hoisted(() => new Map<string, unknown>());

vi.mock('../src/redis.ts', () => ({
  getCachedData: vi.fn(async (key: string) => cache.get(key) ?? null),
  setCachedData: vi.fn(async (key: string, value: unknown) => { cache.set(key, value); }),
  deleteCachedData: vi.fn(async (key: string) => { cache.delete(key); }),
}));

import { app } from '../src/app.ts';


const places = [
  { placeId: '1ee9a256', mainText: 'Nafplio', secondaryText: 'Ελλάδα' },
  { placeId: 'e06e1bd0', mainText: 'Nafpliou', secondaryText: 'Αθήνα, Ελλάδα' },
];

const fetchMock = vi.fn();

// Builds a real Response object, like the one fetch returns
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  cache.clear();
  fetchMock.mockReset();              // forget previous calls and responses
  vi.stubGlobal('fetch', fetchMock);  // the route's fetch() is now our fake
});

afterEach(() => {
  vi.unstubAllGlobals();              // put the real fetch back
});

describe('GET /api/areas/:input', () => {
  it('returns the places from the places API', async () => {
    fetchMock.mockResolvedValue(jsonResponse(places));       // decide what the "API" answers

    const res = await request(app).get('/api/areas/nafpli');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ places });
    expect(fetchMock.mock.calls[0][0]).toBe('https://places.test/?input=nafpli');
  });

  it('serves a repeated search from the cache', async () => {
  fetchMock.mockResolvedValue(jsonResponse(places));

  await request(app).get('/api/areas/nafpli');
  await request(app).get('/api/areas/nafpli');

  expect(fetchMock).toHaveBeenCalledOnce();
});

  it('rejects input with special characters', async () => {
  const res = await request(app).get(`/api/areas/${encodeURIComponent('Nafplio&1')}`);

  expect(res.status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});

  it('rejects input shorter than 3 characters', async () => {
    const res = await request(app).get('/api/areas/na');

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();   // validation happens BEFORE the external call
  });

   it('returns [] when not input match found', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));   
    const res = await request(app).get('/api/areas/patra');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({places:[]});
    expect(fetchMock.mock.calls[0][0]).toBe('https://places.test/?input=patra');
  });

  it('returns 502 when the places API times out', async () => {
    // Simulate exactly what AbortSignal.timeout throws
    fetchMock.mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError'));

    const res = await request(app).get('/api/areas/nafpli');

    expect(res.status).toBe(502);
  });

  it('returns 502 when the places API responds with an error', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ message: 'Forbidden' }, 403));

  const res = await request(app).get('/api/areas/nafpli');

  expect(res.status).toBe(502);
});
});
