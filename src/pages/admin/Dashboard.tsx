import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, LayoutDashboard, Settings, Bell, Filter, Download } from 'lucide-react';
import UserManagement from '../../components/admin/UserManagement';
import DashboardStats from '../../components/admin/DashboardStats';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Button from '../../components/Button';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      timestamp: new Date().toISOString(),
      report: 'admin_dashboard_export'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-dark-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${
                    activeTab === 'dashboard'
                      ? 'border-indigo-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-indigo-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="w-4 h-4" />}
                >
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-800" />
                </button>
                <ThemeToggle />
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="w-4 h-4" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <select className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Status
                </label>
                <select className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option>All Users</option>
                  <option>Active Users</option>
                  <option>Inactive Users</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option>Last Login</option>
                  <option>Registration Date</option>
                  <option>Activity Level</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {showNotifications && (
          <div className="mb-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    New user registration
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    A new user has registered and requires approval
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    2 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="flex-shrink-0">
                  <Settings className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    System update
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    New features are available in the admin dashboard
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    1 hour ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'users' && <UserManagement />}
      </main>
    </div>
  );
}