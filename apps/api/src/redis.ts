import { createClient } from 'redis';
const DEFAULT_EXP_TIME= 60 * 60 * 24; // 24h 

export const redis = createClient({
  url: process.env.REDIS_URL,
  disableOfflineQueue: true, // fail fast instead of queueing commands while Redis is down
});

redis.on('error', (err) => console.error('Redis error:', err.message));
redis.connect().catch(() => {}); // the server keeps running without Redis; the client retries in the background



export async function getCachedData(key: string): Promise<unknown | null> {
  if (!redis.isReady) return null;
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Redis read failed', e);
    return null;
  }
}

export async function setCachedData(key: string, value: unknown, expiration_time=DEFAULT_EXP_TIME) {
  if (!redis.isReady) return;
  try {
    await redis.setEx(key, expiration_time, JSON.stringify(value));
  } catch (e) {
    console.error('Redis write failed', e);
  }
}

export async function deleteCachedData(key: string) {
  if (!redis.isReady) return;
  try {
    await redis.del(key);
  } catch (e) {
    console.error('Redis delete failed', e);
  }
}
