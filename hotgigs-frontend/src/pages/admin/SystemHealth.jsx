import React, { useState, useEffect } from 'react';
import {
  Activity, Server, Database, Mail, Key, CheckCircle, XCircle,
  AlertCircle, RefreshCw, TrendingUp, Cpu, HardDrive, Zap
} from 'lucide-react';

const SystemHealth = () => {
  const [services, setServices] = useState([
    { id: 1, name: 'API Server', status: 'healthy', uptime: '99.9%', responseTime: '45ms', icon: <Server className="w-6 h-6" /> },
    { id: 2, name: 'Database', status: 'healthy', uptime: '100%', responseTime: '12ms', icon: <Database className="w-6 h-6" /> },
    { id: 3, name: 'Email Service', status: 'healthy', uptime: '99.5%', responseTime: '120ms', icon: <Mail className="w-6 h-6" /> },
    { id: 4, name: 'Authentication', status: 'healthy', uptime: '99.8%', responseTime: '35ms', icon: <Key className="w-6 h-6" /> },
    { id: 5, name: 'AI Services', status: 'degraded', uptime: '98.2%', responseTime: '250ms', icon: <Zap className="w-6 h-6" /> }
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 125
  });

  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      down: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMetricColor = (value) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health</h1>
          <p className="text-gray-600">Monitor application services and infrastructure</p>
        </div>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">All Systems Operational</h2>
            <p className="text-green-100">Last checked: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-12 h-12" />
            <span className="text-4xl font-bold">100%</span>
          </div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                {service.icon}
              </div>
              {getStatusIcon(service.status)}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-semibold text-gray-900">{service.uptime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-semibold text-gray-900">{service.responseTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.cpu)}`}>
              {systemMetrics.cpu}%
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">CPU Usage</h3>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${systemMetrics.cpu}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.memory)}`}>
              {systemMetrics.memory}%
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Memory Usage</h3>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${systemMetrics.memory}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.disk)}`}>
              {systemMetrics.disk}%
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Disk Usage</h3>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${systemMetrics.disk}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {systemMetrics.network} MB/s
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Network Traffic</h3>
          <div className="mt-3 text-sm text-gray-500">
            ↑ 85 MB/s ↓ 40 MB/s
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Incidents</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">AI Service Degraded Performance</h3>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-600">
                AI matching service experiencing higher than normal response times. Investigating root cause.
              </p>
              <div className="mt-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  Investigating
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">Database Maintenance Completed</h3>
                <span className="text-sm text-gray-500">Yesterday</span>
              </div>
              <p className="text-sm text-gray-600">
                Scheduled database maintenance completed successfully. All services restored to normal operation.
              </p>
              <div className="mt-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Resolved
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">Email Service Upgrade</h3>
                <span className="text-sm text-gray-500">3 days ago</span>
              </div>
              <p className="text-sm text-gray-600">
                Email service upgraded to latest version. Improved delivery rates and performance.
              </p>
              <div className="mt-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;

