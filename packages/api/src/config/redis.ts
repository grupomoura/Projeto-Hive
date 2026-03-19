import { env } from './env';

// Use dynamic import to share the same ioredis version with BullMQ
import IORedis from 'ioredis';

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
}) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
