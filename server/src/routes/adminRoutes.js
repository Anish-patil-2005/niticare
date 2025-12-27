import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js'; // The multer config we built earlier

const router = express.Router();

// Route: POST /api/v1/admin/sync-data
// Feature 1 : Upload and sync Government CSV
router.post(
    '/sync-data', 
    protect, 
    restrictTo('admin'), 
    upload.single('govt_file'), 
    adminController.uploadGovtData
);


// Feature 2: Data Cleaning
router.get('/incomplete-data', protect, restrictTo('admin'), adminController.getIncompleteBeneficiaries);
router.patch('/update-beneficiary/:id', protect, restrictTo('admin'), adminController.updateBeneficiaryData);


// Feature 3: Advanced Filtering
// You don't change the body; you change the URL.
// To get EVERYONE: GET http://localhost:5000/api/v1/admin/beneficiaries
// To get only women in "Pune": GET http://localhost:5000/api/v1/admin/beneficiaries?district=Pune
// To get only women in "Chakan" village who have "Incomplete" data: GET http://localhost:5000/api/v1/admin/beneficiaries?village=Chakan&is_data_complete=false

// Note: This replaces a simple "get all" with a filtered "get all"
router.get('/beneficiaries', protect, restrictTo('admin'), adminController.getAllBeneficiaries);


// Feature 4: CSV Export
router.get('/export-csv', protect, restrictTo('admin'), adminController.exportBeneficiariesCSV);


// Feature 5 
router.post('/allocate/manual', protect, restrictTo('admin'), adminController.allocateManual);
router.post('/allocate/village', protect, restrictTo('admin'), adminController.allocateByVillage);
router.post('/allocate/limit', protect, restrictTo('admin'), adminController.allocateByLimit);

router.get('/assignments', protect, restrictTo('admin'), adminController.getAssignments);

// Feature 6: Dashboard Stats
router.get('/dashboard', protect, restrictTo('admin'), adminController.getDashboardStats);

// Feature 7: ASHA Management
router.get('/ashas', protect, restrictTo('admin'), adminController.getAllAshas); // Get List
router.post('/ashas', protect, restrictTo('admin'), adminController.addAshaWorker); // Create
router.delete('/ashas/:id', protect, restrictTo('admin'), adminController.deleteAshaWorker); // Delete

//Feature 8 :  Form Management Routes
router.post('/forms', protect, restrictTo('admin'), adminController.createDynamicForm);
router.get('/forms/:phase', protect, adminController.getFormsByPhase); // Both Admin & ASHA can see schemas
router.delete('/forms/:id', protect, restrictTo('admin'), adminController.deleteForm);
router.patch('/forms/:id/toggle', protect, restrictTo('admin'), adminController.toggleFormStatus);


export default router;