import express from 'express';
import { login,forgotPassword,resetPassword,signup } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// The token comes from the email link: /reset-password/abcdef123456...
router.patch('/reset-password/:token',resetPassword);
router.post('/signup', signup);

export default router;