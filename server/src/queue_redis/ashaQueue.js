
// THISIS FOR LCOALHOST
// import { Queue } from 'bullmq';
// import IORedis from 'ioredis';

// const redisUrl = process.env.REDIS_URL // LOCALHOST 'redis://127.0.0.1:6379';

// const connection = new IORedis(redisUrl, {
//   maxRetriesPerRequest: null,
// });

// connection.on('connect', () => console.log('[REDIS] 🔌 Connected to Redis for Queueing'));
// connection.on('error', (err) => console.error('[REDIS] ❌ Queue Connection Error:', err.message));

// export const ashaQueue = new Queue('asha-onboarding', { connection });

// export const addAshaJob = async (filePath) => {
//   // Returning the add call so we can access the job.id in the controller
//   return await ashaQueue.add('process-csv', { filePath });
// };


import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// 1. Get the URL from Render Environment Variables
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// 2. Optimized Connection for Cloud (Upstash/Render)
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  
  // CRITICAL: Upstash requires TLS (SSL) for 'rediss://' URLs
  // This block safely ignores self-signed certificate errors common in cloud setups
  tls: redisUrl.startsWith('rediss://') 
    ? { rejectUnauthorized: false } 
    : undefined,

  // Helps maintain connection during Render's "cold starts"
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  connectTimeout: 10000, // 10 seconds timeout for slow cloud starts
});

// Event Listeners for Debugging in Render Logs
connection.on('connect', () => console.log('[REDIS] 🔌 Connected to Upstash/Redis Successfully'));
connection.on('error', (err) => {
  console.error('[REDIS] ❌ Connection Error:', err.message);
  if (err.message.includes('EPROTO')) {
    console.error('[HINT] This usually means you are missing the "tls" config for an rediss:// URL.');
  }
});

export const ashaQueue = new Queue('asha-onboarding', { connection });

export const addAshaJob = async (filePath) => {
  return await ashaQueue.add('process-csv', { filePath });
};