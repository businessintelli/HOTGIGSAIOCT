import React, { useState } from 'react';
import {
  LayoutDashboard, Mail, Settings, Key, Database, FileText,
  AlertTriangle, Activity, Users, CheckCircle, XCircle,
  AlertCircle, Info, Clock, Search, Filter, Eye, Download,
  RefreshCw, Trash2, Edit, Plus, EyeOff, Server, HardDrive,
  Cpu, Zap
} from 'lucide-react';

const AdminDashboardDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockErrorLogs = [
    {
      id: 1,
      created_at: new Date().toISOString(),
      severity: 'error',
      category: 'email',
      error_code: 'SMTP_CONNECTION_FAILED',
      message: 'Failed to connect to SMTP server smtp.gmail.com:587',
      user_email: 'john@example.com',
      ip_address: '192.168.1.100',
      stack_trace: 'Traceback (most recent call last):\n  File "email_service.py", line 45, in send_email\n    smtp.connect()\nConnectionError: Connection timeout'
    },
    {
      id: 2,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      severity: 'critical',
      category: 'database',
      error_code: 'DB_CONNECTION_LOST',
      message: 'Lost connection to MySQL server during query',
      user_email: null,
      ip_address: '10.0.0.5',
      stack_trace: 'Traceback (most recent call last):\n  File "db.py", line 123, in execute\n    cursor.execute(query)\nMySQLdb.OperationalError: (2006, "MySQL server has gone away")'
    },
    {
      id: 3,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      severity: 'warning',
      category: 'file_upload',
      error_code: 'FILE_TOO_LARGE',
      message: 'Resume file exceeds maximum size of 10MB',
      user_email: 'recruiter@company.com',
      ip_address: '203.0.113.42',
      stack_trace: null
    }
  ];

  const mockEmailLogs = [
    {
      id: 1,
      recipient: 'john@example.com',
      subject: 'Welcome to HotGigs.ai',
      template_name: 'welcome_email',
      status: 'bounced',
      sent_at: new Date().toISOString(),
      error: 'Email address does not exist'
    },
    {
      id: 2,
      recipient: 'jane@company.com',
      subject: 'Password Reset Request',
      template_name: 'password_reset',
      status: 'delivered',
      sent_at: new Date(Date.now() - 1800000).toISOString(),
      error: null
    },
    {
      id: 3,
      recipient: 'recruiter@startup.com',
      subject: 'New Job Application',
      template_name: 'application_notification',
      status: 'failed',
      sent_at: new Date(Date.now() - 3600000).toISOString(),
      error: 'SMTP connection timeout'
    }
  ];

  const mockConfigs = [
    { id: 1, key: 'SMTP_HOST', value: 'smtp.gmail.com', category: 'email', value_type: 'string', is_secret: false, description: 'SMTP server hostname' },
    { id: 2, key: 'SMTP_PASSWORD', value: '********', category: 'email', value_type: 'secret', is_secret: true, description: 'SMTP authentication password' },
    { id: 3, key: 'DATABASE_URL', value: '********', category: 'database', value_type: 'secret', is_secret: true, description: 'Database connection string' },
    { id: 4, key: 'OPENAI_API_KEY', value: '********', category: 'api_keys', value_type: 'secret', is_secret: true, description: 'OpenAI API key for AI features' },
    { id: 5, key: 'MAX_RESUME_SIZE_MB', value: '10', category: 'features', value_type: 'number', is_secret: false, description: 'Maximum resume file size in MB' },
    { id: 6, key: 'ENABLE_AI_MATCHING', value: 'true', category: 'features', value_type: 'boolean', is_secret: false, description: 'Enable AI-powered candidate matching' }
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      error: 'bg-orange-100 text-orange-800 border-orange-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'bounced':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800',
      bounced: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      sent: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      database: 'bg-green-100 text-green-800',
      authentication: 'bg-purple-100 text-purple-800',
      api_keys: 'bg-yellow-100 text-yellow-800',
      features: 'bg-pink-100 text-pink-800',
      system: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.system;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard Demo</h1>
        <p className="text-blue-100">HotGigs.ai Administration - Feature Preview</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'error-logs', label: 'Error Logs', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'email-logs', label: 'Email Logs', icon: <FileText className="w-4 h-4" /> },
              { id: 'config', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
              { id: 'health', label: 'System Health', icon: <Activity className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">342</p>
                  </div>
                  <Database className="w-12 h-12 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Critical Errors</p>
                    <p className="text-3xl font-bold text-red-900">3</p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">System Health</p>
                    <p className="text-3xl font-bold text-green-900">98%</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-600">john@example.com - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email delivery failed</p>
                    <p className="text-xs text-gray-600">SMTP connection error - 15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">New job posted</p>
                    <p className="text-xs text-gray-600">Senior React Developer - 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Logs Tab */}
        {activeTab === 'error-logs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Error Logs</h2>
              <div className="flex gap-3">
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-gray-900">{mockErrorLogs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-900">1</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
                <p className="text-sm text-orange-600">Errors</p>
                <p className="text-2xl font-bold text-orange-900">1</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
                <p className="text-sm text-yellow-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-900">1</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
                <p className="text-sm text-blue-600">Info</p>
                <p className="text-2xl font-bold text-blue-900">0</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search errors..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>Error</option>
                  <option>Warning</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Categories</option>
                  <option>Database</option>
                  <option>Email</option>
                  <option>File Upload</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Time</option>
                  <option>Last Hour</option>
                  <option>Today</option>
                  <option>This Week</option>
                </select>
              </div>
            </div>

            {/* Error Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Error</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockErrorLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(log.severity)}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.category}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {log.error_code}
                        </code>
                        <p className="text-sm text-gray-900 mt-1">{log.message}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.user_email || 'System'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Email Logs Tab */}
        {activeTab === 'email-logs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Email Logs</h2>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg">
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Recipient</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Template</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sent At</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockEmailLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.recipient}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.template_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        {log.error && (
                          <p className="text-xs text-red-600 mt-1">{log.error}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg">
                <Plus className="w-5 h-5 inline mr-2" />
                Add Configuration
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Important Notice</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Changes to configuration values may require application restart to take effect.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Key</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockConfigs.map(config => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{config.key}</p>
                        <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {config.value}
                          </code>
                          {config.is_secret && (
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(config.category)}`}>
                          {config.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{config.value_type}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'health' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg">
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Refresh Status
              </button>
            </div>

            {/* Overall Status */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">All Systems Operational</h3>
                  <p className="text-green-100">Last checked: {new Date().toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-12 h-12" />
                  <span className="text-4xl font-bold">98%</span>
                </div>
              </div>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { name: 'API Server', status: 'healthy', uptime: '99.9%', responseTime: '45ms', icon: <Server className="w-6 h-6" /> },
                { name: 'Database', status: 'healthy', uptime: '100%', responseTime: '12ms', icon: <Database className="w-6 h-6" /> },
                { name: 'Email Service', status: 'healthy', uptime: '99.5%', responseTime: '120ms', icon: <Mail className="w-6 h-6" /> },
                { name: 'Authentication', status: 'healthy', uptime: '99.8%', responseTime: '35ms', icon: <Key className="w-6 h-6" /> },
                { name: 'AI Services', status: 'degraded', uptime: '98.2%', responseTime: '250ms', icon: <Zap className="w-6 h-6" /> },
                { name: 'Redis Cache', status: 'healthy', uptime: '100%', responseTime: '8ms', icon: <Database className="w-6 h-6" /> }
              ].map((service, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      {service.icon}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      service.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-3">{service.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-semibold text-gray-900">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-semibold text-gray-900">{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'CPU Usage', value: 45, icon: <Cpu className="w-6 h-6" />, color: 'text-green-600' },
                  { label: 'Memory', value: 62, icon: <Server className="w-6 h-6" />, color: 'text-yellow-600' },
                  { label: 'Disk Usage', value: 38, icon: <HardDrive className="w-6 h-6" />, color: 'text-green-600' },
                  { label: 'Network', value: 125, icon: <Activity className="w-6 h-6" />, color: 'text-blue-600', unit: 'MB/s' }
                ].map((metric, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                        {metric.icon}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}{metric.unit || '%'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardDemo;

