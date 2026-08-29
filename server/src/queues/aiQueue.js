import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config/env.js';

let aiQueue = null;
let isRedisAvailable = false;

// Check Redis connection
try {
  let redisConnection;
  if (config.redis.url) {
    redisConnection = new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  } else {
    const isTls = config.redis.host?.includes('upstash.io');
    redisConnection = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      ...(isTls && { tls: {} }),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: () => null,
      lazyConnect: true,
    });
  }

  redisConnection.connect().then(() => {
    isRedisAvailable = true;
    console.log('[Queue] Redis connected for BullMQ queues');
  }).catch((err) => {
    console.log(`[Queue] Redis connection note (${err.message}). Using in-memory background job runner.`);
  });

  aiQueue = new Queue('ai-processing', {
    connection: redisConnection,
  });
} catch (e) {
  console.warn('[Queue] BullMQ initialization note:', e.message);
}

// In-Memory job fallback handlers
const memoryJobHandlers = new Map();

export const registerMemoryJobHandler = (jobName, handler) => {
  memoryJobHandlers.set(jobName, handler);
};

export const addAIJob = async (jobName, data, options = {}) => {
  if (isRedisAvailable && aiQueue) {
    try {
      return await aiQueue.add(jobName, data, options);
    } catch (e) {
      console.warn('[Queue] BullMQ add failed, using in-memory runner:', e.message);
    }
  }

  // In-memory async execution
  const handler = memoryJobHandlers.get(jobName);
  if (handler) {
    setTimeout(async () => {
      try {
        await handler({ name: jobName, data });
      } catch (err) {
        console.error(`[In-Memory Queue] Error executing job ${jobName}:`, err.message);
      }
    }, 100);
  }

  return { id: `mem_${Date.now()}`, data };
};
