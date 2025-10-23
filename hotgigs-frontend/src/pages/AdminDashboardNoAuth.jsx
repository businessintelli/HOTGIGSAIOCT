import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Mail, Settings, Key, Database, FileText,
  LogOut, Shield, Menu, X, BarChart3, Users, Activity, AlertTriangle
} from 'lucide-react';

const AdminDashboardNoAuth = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('overview');

  const menuItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin/dashboard',
      exact: true
    },
    {
      id: 'candidates',
      title: 'Master Database',
      icon: <Database className="w-5 h-5" />,
      path: '/admin/candidates',
      description: 'View all candidates across all recruiters'
    },
    {
      id: 'email-templates',
      title: 'Email Templates',
      icon: <Mail className="w-5 h-5" />,
      path: '/admin/email-templates'
    },
    {
      id: 'email-logs',
      title: 'Email Logs',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/email-logs'
    },
    {
      id: 'error-logs',
      title: 'Error Logs',
      icon: <AlertTriangle className="w-5 h-5" />,
      path: '/admin/error-logs'
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/config'
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      icon: <Key className="w-5 h-5" />,
      path: '/admin/api-keys'
    },
    {
      id: 'system-health',
      title: 'System Health',
      icon: <Activity className="w-5 h-5" />,
      path: '/admin/system-health'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/admin/analytics'
    }
  ];

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
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-lg font-bold">Admin</h1>
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

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeMenu === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {sidebarOpen && (
            <div className="mb-3 p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Admin User</span>
              </div>
              <p className="text-xs text-gray-400">admin@hotgigs.ai</p>
            </div>
          )}
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(m => m.id === activeMenu)?.title || 'Overview'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {menuItems.find(m => m.id === activeMenu)?.description || 'Admin Dashboard'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Healthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeMenu === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">1,247</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Database className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">342</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Active Jobs</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">3</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Critical Errors</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">98%</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">System Health</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New user registered</p>
                      <p className="text-xs text-gray-500">john@example.com • 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email delivery failed</p>
                      <p className="text-xs text-gray-500">SMTP connection error • 15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New job posted</p>
                      <p className="text-xs text-gray-500">Senior React Developer • 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'candidates' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Master Candidate Database</h3>
                <p className="text-gray-600 mb-6">
                  View and manage all candidates across all recruiters
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">247</div>
                    <div className="text-sm text-gray-600">Total Candidates</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Active Recruiters</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">78%</div>
                    <div className="text-sm text-gray-600">Avg Match Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  This page shows all candidates from all recruiters with sharing and permission controls.
                </p>
              </div>
            </div>
          )}

          {activeMenu !== 'overview' && activeMenu !== 'candidates' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center py-12">
                {menuItems.find(m => m.id === activeMenu)?.icon}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                  {menuItems.find(m => m.id === activeMenu)?.title}
                </h3>
                <p className="text-gray-600">
                  This section is available in the full admin dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNoAuth;

