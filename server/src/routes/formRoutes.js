import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {getDashboardForms,getFormById} from '../controllers/formController.js'

// formRoutes.js
const router = express.Router();

// This becomes GET /api/v1/forms/dashboard
router.get('/dashboard', protect, getDashboardForms); 
router.get('/:id',protect, getFormById);

export default router;