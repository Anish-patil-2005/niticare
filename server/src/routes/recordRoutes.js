import express from 'express';
import { saveANCRecord, getANCRecord } from '../controllers/recordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get existing data for a specific form/month
router.get('/get-single', protect, getANCRecord);

// Save or Update data
router.post('/save', protect, saveANCRecord);

export default router;