import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { getAshaLogs } from '../controllers/asha_log.js';

const router = express.Router();

router.get('/',protect,getAshaLogs);

export default router