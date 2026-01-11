import express from 'express';
import * as ashaController from '../controllers/ashaController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, restrictTo('asha'), ashaController.registerBeneficiary);
router.get('/my-beneficiaries', protect, restrictTo('asha'), ashaController.getMyBeneficiaries);
router.get('/beneficiary/:id', protect, restrictTo('asha', 'admin'), ashaController.getBeneficiaryById);
router.delete(
  '/delete-beneficiary/:id', 
  protect, 
  restrictTo('admin', 'asha'), 
  ashaController.deleteManualBeneficiary
);

router.patch('/update-beneficiary/:id', protect, restrictTo('asha'), ashaController.updateMyBeneficiary);

// stats
router.get('/stats',protect,restrictTo('asha'),ashaController.getAshaStats);
router.get('/tasks/today', protect, restrictTo('asha'), ashaController.getTodayPriorityTasks);

export default router;