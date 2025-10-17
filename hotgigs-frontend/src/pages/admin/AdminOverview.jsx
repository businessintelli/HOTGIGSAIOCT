import React, { useState, useEffect } from 'react';
import {
  Mail, Database, Key, FileText, TrendingUp, Users,
  Activity, CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalEmails: 1247,
    emailsToday: 89,
    activeTemplates: 8,
    apiKeys: 3,
    configItems: 12,
    systemHealth: 'healthy'
  });

  const recentActivity = [
    { id: 1, action: 'Email sent', details: 'Interview Invitation to john@example.com', time: '2 minutes ago', status: 'success' },
    { id: 2, action: 'Config updated', details: 'RESEND_FROM_EMAIL changed', time: '15 minutes ago', status: 'success' },
    { id: 3, action: 'Template created', details: 'New template: Job Alert', time: '1 hour ago', status: 'success' },
    { id: 4, action: 'Email bounced', details: 'Bounced email to invalid@example.com', time: '2 hours ago', status: 'warning' },
    { id: 5, action: 'API key added', details: 'New OpenAI API key configured', time: '3 hours ago', status: 'success' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor and manage your HotGigs.ai application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">+12%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Emails</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEmails}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.emailsToday} sent today</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-blue-600 font-semibold">Active</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Email Templates</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeTemplates}</p>
          <p className="text-xs text-gray-500 mt-2">All templates active</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Key className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">Secure</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">API Keys</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.apiKeys}</p>
          <p className="text-xs text-gray-500 mt-2">All keys active</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Database className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-green-600 font-semibold">Healthy</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">System Health</h3>
          <p className="text-3xl font-bold text-gray-900 capitalize">{stats.systemHealth}</p>
          <p className="text-xs text-gray-500 mt-2">All services operational</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View All Activity →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <Mail className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">New Template</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <Key className="w-8 h-8 text-gray-600 group-hover:text-purple-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Add API Key</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <Database className="w-8 h-8 text-gray-600 group-hover:text-green-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Update Config</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all group">
              <FileText className="w-8 h-8 text-gray-600 group-hover:text-yellow-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">View Logs</p>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">System Status: All Systems Operational</h3>
            <p className="text-blue-100 text-sm">Last checked: Just now</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8" />
            <span className="text-2xl font-bold">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

