import React, { useState, useEffect } from 'react';
import { Bell, Mail, Briefcase, Calendar, TrendingUp, MessageSquare, CheckCircle, Save } from 'lucide-react';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    application_updates: true,
    interview_notifications: true,
    job_recommendations: true,
    weekly_digest: true,
    marketing_emails: false,
    recruiter_messages: true,
    status_updates: true
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const preferenceOptions = [
    {
      key: 'application_updates',
      icon: <Briefcase className="w-5 h-5" />,
      title: 'Application Updates',
      description: 'Get notified when your application status changes'
    },
    {
      key: 'interview_notifications',
      icon: <Calendar className="w-5 h-5" />,
      title: 'Interview Notifications',
      description: 'Receive interview invitations and reminders'
    },
    {
      key: 'job_recommendations',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Job Recommendations',
      description: 'Get personalized job recommendations based on your profile'
    },
    {
      key: 'weekly_digest',
      icon: <Mail className="w-5 h-5" />,
      title: 'Weekly Digest',
      description: 'Receive a weekly summary of new jobs and updates'
    },
    {
      key: 'marketing_emails',
      icon: <Bell className="w-5 h-5" />,
      title: 'Marketing Emails',
      description: 'Get updates about new features and promotions'
    },
    {
      key: 'recruiter_messages',
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Recruiter Messages',
      description: 'Receive messages from recruiters'
    },
    {
      key: 'status_updates',
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Status Updates',
      description: 'Get notified about important account and application status changes'
    }
  ];

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaved(true);
      setLoading(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
    
    // TODO: Replace with actual API call
    // try {
    //   const response = await fetch('/api/email-preferences/1', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(preferences)
    //   });
    //   if (response.ok) {
    //     setSaved(true);
    //     setTimeout(() => setSaved(false), 3000);
    //   }
    // } catch (error) {
    //   console.error('Failed to save preferences:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Email Preferences
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your email notification preferences. Choose which emails you want to receive from HotGigs.ai.
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Your preferences have been saved successfully!</p>
          </div>
        )}

        {/* Preferences Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {preferenceOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences[option.key]
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[option.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
          </div>

          {/* Unsubscribe Link */}
          <div className="mt-6 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Unsubscribe from all emails
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Important Notice
          </h3>
          <p className="text-sm text-blue-800">
            Some emails are essential for the operation of your account and cannot be disabled. 
            These include security alerts, password resets, and critical account notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreferences;

