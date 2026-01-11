import express from 'express';
import { login,forgotPassword,resetPassword,signup, getProfile,updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; // Using your 'protect' export

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// The token comes from the email link: /reset-password/abcdef123456...
router.patch('/reset-password/:token',resetPassword);
router.post('/signup', signup);


// profile section
router.get('/me', protect, getProfile);
router.put('/update-profile', protect, updateProfile);

export default router;