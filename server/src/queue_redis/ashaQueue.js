import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on('connect', () => console.log('[REDIS] 🔌 Connected to Redis for Queueing'));
connection.on('error', (err) => console.error('[REDIS] ❌ Queue Connection Error:', err.message));

export const ashaQueue = new Queue('asha-onboarding', { connection });

export const addAshaJob = async (filePath) => {
  // Returning the add call so we can access the job.id in the controller
  return await ashaQueue.add('process-csv', { filePath });
};