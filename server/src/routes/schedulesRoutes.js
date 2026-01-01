// server/src/routes/formRoutes.js
import express from 'express';

import { createOrUpdateSchedule } from '../controllers/scheduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router  = express.Router();

router.post('/', createOrUpdateSchedule);

export default router;
