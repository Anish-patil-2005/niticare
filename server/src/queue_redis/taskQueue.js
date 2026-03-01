import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// We use one queue 'task-allocation' for all background admin tasks
export const taskQueue = new Queue('task-allocation', { connection });

// Helper for other parts of the app
export const addTaskJob = (data) => taskQueue.add('generic-task', data);