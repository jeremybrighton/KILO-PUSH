import User from '../models/User.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// Disable user account (admin only)
export const disableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent disabling admin
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot disable admin user.' });
    }

    user.isDisabled = true;
    await user.save();

    res.json({ message: 'User has been disabled.', user });
  } catch (error) {
    console.error('Disable user error:', error);
    res.status(500).json({ error: 'Failed to disable user.' });
  }
};

// Enable user account (admin only)
export const enableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isDisabled = false;
    await user.save();

    res.json({ message: 'User has been enabled.', user });
  } catch (error) {
    console.error('Enable user error:', error);
    res.status(500).json({ error: 'Failed to enable user.' });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isDisabled: false, isVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const pendingVerifications = await User.countDocuments({ isVerified: false });

    // Generate demo fraud data (in production, this would come from ML service)
    const demoData = {
      totalTransactions: 15420,
      fraudDetected: 342,
      suspiciousVendors: 12,
      systemAlerts: 5,
      fraudRate: 2.22,
      recentTransactions: [
        { id: 1, vendor: 'TechStore', amount: 150.00, risk: 'low', timestamp: new Date() },
        { id: 2, vendor: 'QuickMart', amount: 45.50, risk: 'medium', timestamp: new Date() },
        { id: 3, vendor: 'OnlineShop', amount: 299.99, risk: 'high', timestamp: new Date() },
        { id: 4, vendor: 'GasStation', amount: 35.00, risk: 'low', timestamp: new Date() },
        { id: 5, vendor: 'Unknown', amount: 999.00, risk: 'critical', timestamp: new Date() }
      ],
      fraudByCategory: {
        'Online Shopping': 145,
        'ATM': 89,
        'POS': 67,
        'Wire Transfer': 41
      }
    };

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        pendingVerifications,
        ...demoData
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

// Get fraud transactions (admin only)
export const getFraudTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const risk = req.query.risk;

    // Demo fraud data (in production, this would come from database)
    let transactions = [
      { id: 1, vendor: 'Unknown', amount: 999.00, risk: 'critical', date: new Date(), status: 'investigating' },
      { id: 2, vendor: 'SuspiciousShop', amount: 450.00, risk: 'high', date: new Date(), status: 'flagged' },
      { id: 3, vendor: 'QuickMart', amount: 45.50, risk: 'medium', date: new Date(), status: 'reviewing' },
      { id: 4, vendor: 'FakeStore', amount: 1200.00, risk: 'critical', date: new Date(), status: 'blocked' },
      { id: 5, vendor: 'TechGadgets', amount: 89.99, risk: 'low', date: new Date(), status: 'cleared' }
    ];

    if (risk && risk !== 'all') {
      transactions = transactions.filter(t => t.risk === risk);
    }

    const total = transactions.length;
    const paginatedTransactions = transactions.slice((page - 1) * limit, page * limit);

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fraud transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
};

// Get system alerts (admin only)
export const getSystemAlerts = async (req, res) => {
  try {
    // Demo alerts (in production, this would come from database)
    const alerts = [
      { id: 1, type: 'warning', message: 'Unusual login activity detected from IP 192.168.1.1', timestamp: new Date() },
      { id: 2, type: 'danger', message: 'Multiple failed login attempts for user john@example.com', timestamp: new Date() },
      { id: 3, type: 'info', message: 'New user registration pending verification', timestamp: new Date() },
      { id: 4, type: 'success', message: 'ML model updated successfully', timestamp: new Date() }
    ];

    res.json({ alerts });
  } catch (error) {
    console.error('Get system alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
};
