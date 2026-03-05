import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/me - Get current user's profile
router.get('/me', async (req, res) => {
  try {
    const user = await req.user;
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile.' });
  }
});

// PUT /api/users/me - Update current user's profile
router.put('/me', async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;
    
    if (name) {
      user.name = name;
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
