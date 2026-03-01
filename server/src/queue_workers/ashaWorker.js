import { Worker } from 'bullmq';
import { importAshaCsv } from '../services/dataSyncService.js';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on('connect', () => console.log('[WORKER] 🔌 Background Worker connected to Redis'));

const worker = new Worker('asha-onboarding', async (job) => {
  console.log(`[WORKER] ⚙️ Processing Job ${job.id} | File: ${job.data.filePath}`);
  
  try {
    const count = await importAshaCsv(job.data.filePath);
    console.log(`[WORKER] ✅ Success: Imported ${count} ASHA workers for Job ${job.id}`);
    return count; // Passes result to the 'completed' listener
  } catch (error) {
    console.error(`[WORKER] ❌ Job ${job.id} failed:`, error.message);
    throw error; 
  }
}, { connection });

worker.on('completed', (job, result) => {
  console.log(`[WORKER] 🏁 Job ${job.id} has fully completed. Records processed: ${result}`);
});

worker.on('failed', (job, err) => {
  console.error(`[WORKER] ⚠️ Job ${job.id} moved to Failed state: ${err.message}`);
});