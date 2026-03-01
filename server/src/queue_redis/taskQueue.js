import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Use the Render environment variable or fallback to local
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  
  // REQUIRED FOR UPSTASH/RENDER:
  // Detects if the URL is secure (rediss://) and enables TLS
  tls: redisUrl.startsWith('rediss://') 
    ? { rejectUnauthorized: false } 
    : undefined,
    
  // Added stability for cloud connections
  retryStrategy: (times) => Math.min(times * 50, 2000),
  connectTimeout: 15000, 
});

// Logs to help you verify everything is working in the Render Dashboard
connection.on('connect', () => console.log('[REDIS] 🚀 Task Queue connected to Cloud Redis'));
connection.on('error', (err) => console.error('[REDIS] ❌ Queue Connection Error:', err.message));

export const taskQueue = new Queue('task-allocation', { connection });

export const addTaskJob = (data) => taskQueue.add('generic-task', data);