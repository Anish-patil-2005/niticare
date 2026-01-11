import express from 'express';
import { exportBeneficiariesExcel, exportAshaPerformanceExcel } from '../controllers/reportexportController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both Admins and ASHAs can export, but the data is scoped inside the controller
router.get(
  '/export-beneficiaries',
  protect, 
  // restrictTo('admin', 'asha'), // Uncomment if you want to explicitly list allowed roles
  exportBeneficiariesExcel
);

// Example: A specialized report only for Admins (e.g., ASHA Performance)
// Only Admins should see this
router.get(
  '/asha-performance',
  protect,
  restrictTo('admin'), 
  exportAshaPerformanceExcel
);

export default router;