import express from 'express';
import { 
  register, 
  login, 
  verifyOTP, 
  sendOTP, 
  getCurrentUser,
  logout 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/verify-otp - Verify email with OTP
router.post('/verify-otp', verifyOTP);

// POST /api/auth/send-otp - Resend OTP
router.post('/send-otp', sendOTP);

// GET /api/auth/me - Get current user (protected)
router.get('/me', authenticateToken, getCurrentUser);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

export default router;
