import app from './src/app.js';
// --- AUTO-TRIGGER BACKGROUND WORKERS ---
import './src/queue_workers/ashaWorker.js';
import './src/queue_workers/taskWorker.js'; 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 NitiCare Backend Running
  📡 Port: ${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}
  🤖 Background Workers: Active
  `);
});