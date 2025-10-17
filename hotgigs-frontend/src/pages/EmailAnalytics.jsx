import React, { useState, useEffect } from 'react';
import { 
  Mail, TrendingUp, Eye, MousePointer, AlertCircle, Users, 
  Calendar, BarChart3, PieChart, Activity 
} from 'lucide-react';

const EmailAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7days');
  
  // Mock data - replace with actual API calls
  const stats = {
    total_sent: 1247,
    total_delivered: 1198,
    total_opened: 856,
    total_clicked: 423,
    total_bounced: 32,
    total_complained: 3,
    delivery_rate: 96.1,
    open_rate: 71.5,
    click_rate: 35.3,
    bounce_rate: 2.6
  };

  const templateStats = [
    { template_name: 'Welcome Email', sent_count: 342, open_rate: 82.5, click_rate: 45.2 },
    { template_name: 'Interview Invitation', sent_count: 156, open_rate: 91.0, click_rate: 67.3 },
    { template_name: 'Application Confirmation', sent_count: 428, open_rate: 68.2, click_rate: 28.4 },
    { template_name: 'Weekly Digest', sent_count: 234, open_rate: 54.7, click_rate: 22.1 },
    { template_name: 'Status Update', sent_count: 87, open_rate: 76.3, click_rate: 41.4 }
  ];

  const recentActivity = [
    { id: 1, event: 'opened', email: 'john@example.com', template: 'Interview Invitation', time: '2 minutes ago' },
    { id: 2, event: 'clicked', email: 'sarah@example.com', template: 'Welcome Email', time: '5 minutes ago' },
    { id: 3, event: 'delivered', email: 'mike@example.com', template: 'Application Confirmation', time: '8 minutes ago' },
    { id: 4, event: 'opened', email: 'emma@example.com', template: 'Weekly Digest', time: '12 minutes ago' },
    { id: 5, event: 'clicked', email: 'david@example.com', template: 'Status Update', time: '15 minutes ago' }
  ];

  const getEventIcon = (event) => {
    switch (event) {
      case 'opened':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'clicked':
        return <MousePointer className="w-4 h-4 text-green-600" />;
      case 'delivered':
        return <Mail className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case 'opened':
        return 'bg-blue-100 text-blue-800';
      case 'clicked':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Email Analytics
              </h1>
              <p className="text-gray-600">
                Track and analyze your email campaign performance
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['24h', '7days', '30days', '90days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range === '24h' ? '24 Hours' : range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total_sent}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Sent</h3>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.open_rate}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Open Rate</h3>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.click_rate}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Click Rate</h3>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+8.7% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.bounce_rate}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Bounce Rate</h3>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 transform rotate-180" />
              <span>-1.3% from last period</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Template Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Template Performance</h2>
            </div>
            
            <div className="space-y-4">
              {templateStats.map((template, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                    <span className="text-sm text-gray-500">{template.sent_count} sent</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Open Rate</span>
                        <span className="font-semibold text-blue-600">{template.open_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          style={{ width: `${template.open_rate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Click Rate</span>
                        <span className="font-semibold text-purple-600">{template.click_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${template.click_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {getEventIcon(activity.event)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(activity.event)}`}>
                        {activity.event}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {activity.email}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {activity.template} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View All Activity →
            </button>
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Engagement Overview</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total_delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
              <div className="text-xs text-gray-500 mt-1">{stats.delivery_rate}% rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.total_opened}</div>
              <div className="text-sm text-gray-600">Opened</div>
              <div className="text-xs text-gray-500 mt-1">{stats.open_rate}% rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.total_clicked}</div>
              <div className="text-sm text-gray-600">Clicked</div>
              <div className="text-xs text-gray-500 mt-1">{stats.click_rate}% rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.total_bounced}</div>
              <div className="text-sm text-gray-600">Bounced</div>
              <div className="text-xs text-gray-500 mt-1">{stats.bounce_rate}% rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAnalytics;

