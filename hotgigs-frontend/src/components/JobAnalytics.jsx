/**
 * Job-Specific Analytics Component
 * Displays comprehensive analytics for a single job posting
 */
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Clock, Award, MapPin, DollarSign } from 'lucide-react';

const JobAnalytics = ({ analytics, jobTitle }) => {
  if (!analytics) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Loading analytics...</p>
      </div>
    );
  }

  const { overview, applicationsTimeline, viewsVsApplications, sources, qualityDistribution,
    topSkills, experienceDistribution, locationDistribution, salaryDistribution, funnel } = analytics;

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Analytics</h2>
        <p className="text-gray-600">{jobTitle}</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          title="Total Views"
          value={overview.totalViews}
          subtitle={`${overview.daysActive} days active`}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          title="Applications"
          value={overview.totalApplications}
          subtitle={`${overview.conversionRate}% conversion`}
          color="green"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          title="Avg Time to Apply"
          value={`${overview.avgTimeToApply} days`}
          subtitle="From view to submit"
          color="orange"
        />
        <MetricCard
          icon={<Award className="w-5 h-5" />}
          title="Avg Quality Score"
          value={`${overview.avgApplicationQuality}%`}
          subtitle={`${overview.activeApplications} in pipeline`}
          color="purple"
        />
      </div>

      {/* Views vs Applications Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Views & Applications Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={viewsVsApplications}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateFormatted" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" name="Views" />
            <Area type="monotone" dataKey="applications" stroke="#10b981" fillOpacity={1} fill="url(#colorApps)" name="Applications" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="applications"
              >
                {sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                  <span className="text-gray-700">{source.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{source.applications}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Candidates">
                {qualityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills from Applicants</h3>
        <div className="space-y-3">
          {topSkills.map((skill, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                <span className="text-sm text-gray-500">{skill.count} candidates ({skill.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${skill.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience & Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={experienceDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <MapPin className="inline w-5 h-5 mr-2" />
            Top Locations
          </h3>
          <div className="space-y-3 mt-4">
            {locationDistribution.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{location.location}</span>
                <span className="font-semibold text-gray-900">{location.count} candidates</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Expectations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <DollarSign className="inline w-5 h-5 mr-2" />
          Salary Expectations
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={salaryDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" name="Candidates" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Application Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Funnel</h3>
        <div className="space-y-2">
          {funnel.map((stage, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                <span className="text-sm text-gray-500">{stage.count} ({stage.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stage.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};

export default JobAnalytics;

