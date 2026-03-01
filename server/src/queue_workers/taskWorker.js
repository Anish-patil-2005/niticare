import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import db from '../db/knex.js';
import { importCsvData } from '../services/dataSyncService.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

const taskWorker = new Worker('task-allocation', async (job) => {
  const { type, village, ashaId, limit, filePath } = job.data;
  
  // Clean logging: only show ASHA ID if it's an allocation task
  const jobInfo = ashaId ? `for ASHA ${ashaId}` : `(System Process)`;
  console.log(`[TASK-WORKER] ⚙️ Executing: ${type} ${jobInfo}`);

  try {
    let resultCount = 0;

    // 1. Handle Bulk Beneficiary CSV Upload
    if (type === 'beneficiary-sync') {
      console.log(`[TASK-WORKER] 📄 Parsing CSV at: ${filePath}`);
      // This service parses CSV, calculates risks, and upserts to DB
      resultCount = await importCsvData(filePath);
    } 

    // 2. Handle Village-based Allocation
    else if (type === 'village') {
      resultCount = await db('beneficiaries')
        .whereNull('assigned_asha_id')
        .whereRaw('LOWER(village) = ?', [village.toLowerCase()])
        .update({ 
          assigned_asha_id: ashaId,
          updated_at: db.fn.now() 
        });
    } 

    // 3. Handle Limit-based Allocation
    else if (type === 'limit') {
      const unassignedIds = await db('beneficiaries')
        .whereNull('assigned_asha_id')
        .limit(limit)
        .select('id');

      const ids = unassignedIds.map(b => b.id);
      if (ids.length > 0) {
        resultCount = await db('beneficiaries')
          .whereIn('id', ids)
          .update({ 
            assigned_asha_id: ashaId,
            updated_at: db.fn.now() 
          });
      }
    }

    console.log(`[TASK-WORKER] ✅ Job ${job.id} finished. Affected Rows: ${resultCount}`);
    return resultCount;

  } catch (error) {
    console.error(`[TASK-WORKER] ❌ Critical Failure in Job ${job.id}:`, error.message);
    // Throwing the error lets BullMQ handle retries automatically
    throw error;
  }
}, { connection });

export default taskWorker;