// server/src/routes/formRoutes.js
import express from 'express';

import { createOrUpdateSchedule,getSchedulesByBeneficiary } from '../controllers/scheduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router  = express.Router();

router.post('/', createOrUpdateSchedule);
router.get('/beneficiary/:id', getSchedulesByBeneficiary);

export default router;
