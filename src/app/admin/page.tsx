'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity,
  Search,
  ChevronRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  LogOut,
  BarChart3,
  Bell,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  pendingVerifications: number;
  totalTransactions: number;
  fraudDetected: number;
  suspiciousVendors: number;
  systemAlerts: number;
}

interface Alert {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if admin
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
    
    setIsLoading(false);
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch stats
      const statsRes = await fetch(`${backendUrl}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch alerts
      const alertsRes = await fetch(`${backendUrl}/api/admin/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Use demo data
      setStats({
        totalUsers: 156,
        activeUsers: 142,
        adminUsers: 3,
        pendingVerifications: 11,
        totalTransactions: 15420,
        fraudDetected: 342,
        suspiciousVendors: 12,
        systemAlerts: 5
      });
      setAlerts([
        { id: 1, type: 'warning', message: 'Unusual login activity detected', timestamp: new Date().toISOString() },
        { id: 2, type: 'danger', message: 'Multiple failed login attempts', timestamp: new Date().toISOString() }
      ]);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${backendUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    const token = localStorage.getItem('token');
    const endpoint = currentStatus 
      ? `${backendUrl}/api/admin/users/${userId}/enable`
      : `${backendUrl}/api/admin/users/${userId}/disable`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">FraudGuard</h1>
              <p className="text-red-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Users</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === 'alerts'
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Alerts</span>
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-xs text-white font-medium">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'dashboard' && 'Admin Dashboard'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'alerts' && 'System Alerts'}
            </h1>
            <p className="text-slate-400">Manage users, view fraud data, and monitor system</p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-green-400">+12%</span>
                  </div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-green-400">+8%</span>
                  </div>
                  <p className="text-slate-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-xs text-red-400">-3%</span>
                  </div>
                  <p className="text-slate-400 text-sm">Fraud Detected</p>
                  <p className="text-2xl font-bold text-white">{stats.fraudDetected}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-slate-400 text-sm">Pending Verifications</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingVerifications}</p>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent System Alerts</h3>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                      alert.type === 'danger' ? 'bg-red-500/10' :
                      alert.type === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.type === 'danger' ? 'text-red-400' :
                        alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`} />
                      <p className="text-slate-200 flex-1">{alert.message}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">All Users</h3>
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white"
                >
                  <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {usersLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr className="text-left text-slate-400 text-xs uppercase">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Verified</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-700/20">
                          <td className="px-6 py-4 text-white">{u.name}</td>
                          <td className="px-6 py-4 text-slate-300">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.isVerified ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-400" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              u.isDisabled ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {u.isDisabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => toggleUserStatus(u._id, u.isDisabled)}
                                disabled={actionLoading === u._id}
                                className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                              >
                                {u.isDisabled ? 'Enable' : 'Disable'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found. Database may be empty.</p>
                  <p className="text-sm mt-1">Register users via the frontend to see them here.</p>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-3 p-4 rounded-lg ${
                    alert.type === 'danger' ? 'bg-red-500/10 border border-red-500/30' :
                    alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-blue-500/10 border border-blue-500/30'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.type === 'danger' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-slate-200">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs uppercase ${
                      alert.type === 'danger' ? 'bg-red-500/20 text-red-400' :
                      alert.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
