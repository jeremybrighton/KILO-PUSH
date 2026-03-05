import express from 'express';
import {
  getAllUsers,
  getUserById,
  disableUser,
  enableUser,
  getDashboardStats,
  getFraudTransactions,
  getSystemAlerts
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

// GET /api/admin/users/:id - Get user by ID
router.get('/users/:id', getUserById);

// PUT /api/admin/users/:id/disable - Disable user
router.put('/users/:id/disable', disableUser);

// PUT /api/admin/users/:id/enable - Enable user
router.put('/users/:id/enable', enableUser);

// GET /api/admin/dashboard - Get admin dashboard stats
router.get('/dashboard', getDashboardStats);

// GET /api/admin/transactions - Get fraud transactions
router.get('/transactions', getFraudTransactions);

// GET /api/admin/alerts - Get system alerts
router.get('/alerts', getSystemAlerts);

export default router;
