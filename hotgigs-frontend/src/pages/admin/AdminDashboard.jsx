import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Mail, Settings, Key, Database, FileText,
  LogOut, Shield, Menu, X, BarChart3, Users, Activity, AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    const info = localStorage.getItem('adminInfo');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    if (info) {
      setAdminInfo(JSON.parse(info));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const menuItems = [
    {
      title: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin/dashboard',
      exact: true
    },
    {
      title: 'Master Database',
      icon: <Database className="w-5 h-5" />,
      path: '/admin/candidates'
    },
    {
      title: 'Email Templates',
      icon: <Mail className="w-5 h-5" />,
      path: '/admin/email-templates'
    },
    {
      title: 'Email Logs',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/email-logs'
    },
    {
      title: 'Error Logs',
      icon: <AlertTriangle className="w-5 h-5" />,
      path: '/admin/error-logs'
    },
    {
      title: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/config'
    },
    {
      title: 'API Keys',
      icon: <Key className="w-5 h-5" />,
      path: '/admin/api-keys'
    },
    {
      title: 'System Health',
      icon: <Activity className="w-5 h-5" />,
      path: '/admin/system-health'
    },
    {
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/admin/analytics'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="font-bold text-lg">Admin Portal</h1>
                  <p className="text-xs text-gray-400">HotGigs.ai</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                  : 'hover:bg-slate-700'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.title}</span>}
            </Link>
          ))}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-slate-700">
          {sidebarOpen && adminInfo && (
            <div className="mb-3 p-3 bg-slate-700 rounded-lg">
              <p className="text-sm font-semibold">{adminInfo.full_name || adminInfo.username}</p>
              <p className="text-xs text-gray-400">{adminInfo.email}</p>
              {adminInfo.is_super_admin && (
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-semibold rounded">
                  Super Admin
                </span>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;

