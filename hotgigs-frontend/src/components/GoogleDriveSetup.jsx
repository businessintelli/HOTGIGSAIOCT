import React, { useState, useEffect } from 'react';
import {
  Cloud, Folder, RefreshCw, Settings, Trash2, Play,
  CheckCircle, AlertCircle, Clock, Plus, ChevronRight
} from 'lucide-react';

const GoogleDriveSetup = () => {
  const [syncs, setSyncs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [newSync, setNewSync] = useState({
    folder_id: '',
    folder_name: '',
    sync_frequency: 'daily'
  });

  useEffect(() => {
    fetchSyncs();
  }, []);

  const fetchSyncs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-drive/syncs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSyncs(data);
      }
    } catch (error) {
      console.error('Error fetching syncs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch('/api/google-drive/auth/url', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Open Google OAuth in new window
        window.open(data.auth_url, '_blank', 'width=600,height=600');
        setSetupStep(2);
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const handleSetupSync = async () => {
    try {
      const response = await fetch('/api/google-drive/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newSync,
          access_token: 'placeholder', // Will be replaced with actual token from OAuth
          refresh_token: 'placeholder'
        })
      });

      if (response.ok) {
        setShowSetupWizard(false);
        setSetupStep(1);
        setNewSync({ folder_id: '', folder_name: '', sync_frequency: 'daily' });
        fetchSyncs();
      }
    } catch (error) {
      console.error('Error setting up sync:', error);
    }
  };

  const handleTriggerSync = async (syncId) => {
    try {
      const response = await fetch(`/api/google-drive/syncs/${syncId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Show success message
        fetchSyncs();
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
    }
  };

  const handleUpdateSync = async (syncId, updates) => {
    try {
      const response = await fetch(`/api/google-drive/syncs/${syncId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchSyncs();
      }
    } catch (error) {
      console.error('Error updating sync:', error);
    }
  };

  const handleDeleteSync = async (syncId) => {
    if (!confirm('Are you sure you want to delete this sync configuration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/google-drive/syncs/${syncId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchSyncs();
      }
    } catch (error) {
      console.error('Error deleting sync:', error);
    }
  };

  const getSyncStatusBadge = (sync) => {
    if (!sync.is_active) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Inactive</span>;
    }
    if (sync.last_sync_at) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Google Drive Integration</h1>
              <p className="text-gray-600 mt-1">
                Automatically import resumes from your Google Drive folders
              </p>
            </div>
            <button
              onClick={() => setShowSetupWizard(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Folder</span>
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <Cloud className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
              <p className="text-sm text-blue-800">
                Connect a Google Drive folder and we'll automatically import new resumes as they're added.
                You can configure sync frequency (daily, weekly, or manual) and manage multiple folders.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Configurations */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sync configurations...</p>
          </div>
        ) : syncs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No folders connected</h3>
            <p className="text-gray-600 mb-6">
              Connect your first Google Drive folder to start importing resumes automatically
            </p>
            <button
              onClick={() => setShowSetupWizard(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect Google Drive
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {syncs.map((sync) => (
              <div
                key={sync.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Folder className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {sync.folder_name || 'Unnamed Folder'}
                        </h3>
                        {getSyncStatusBadge(sync)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Folder ID: {sync.folder_id}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Sync Frequency</p>
                          <p className="font-medium text-gray-900 capitalize">{sync.sync_frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Sync</p>
                          <p className="font-medium text-gray-900">{formatDate(sync.last_sync_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Next Sync</p>
                          <p className="font-medium text-gray-900">{formatDate(sync.next_sync_at)}</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">
                            {sync.total_files_processed} processed
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700">
                            {sync.total_files_synced} synced
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">
                            {sync.total_files_failed} failed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleTriggerSync(sync.id)}
                      disabled={!sync.is_active}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      title="Sync Now"
                    >
                      <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleUpdateSync(sync.id, { is_active: !sync.is_active })}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title={sync.is_active ? 'Pause' : 'Resume'}
                    >
                      <Play className={`w-5 h-5 ${sync.is_active ? 'text-yellow-600' : 'text-green-600'}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteSync(sync.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Connect Google Drive Folder
            </h2>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  setupStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className={`text-sm ${setupStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Authorize
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  setupStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`text-sm ${setupStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Select Folder
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  setupStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className={`text-sm ${setupStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Configure
                </span>
              </div>
            </div>

            {/* Step Content */}
            {setupStep === 1 && (
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  To import resumes from Google Drive, we need permission to access your folders.
                  Click the button below to authorize HotGigs.ai.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>We only request read-only access</strong> to the folders you choose.
                    We never modify or delete your files.
                  </p>
                </div>
                <button
                  onClick={handleGoogleAuth}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Cloud className="w-5 h-5" />
                  <span>Authorize Google Drive</span>
                </button>
              </div>
            )}

            {setupStep === 2 && (
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Enter the Google Drive folder ID you want to sync. You can find this in the folder's URL.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder ID
                    </label>
                    <input
                      type="text"
                      value={newSync.folder_id}
                      onChange={(e) => setNewSync({ ...newSync, folder_id: e.target.value })}
                      placeholder="1a2b3c4d5e6f7g8h9i0j"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Example: https://drive.google.com/drive/folders/<strong>1a2b3c4d5e6f7g8h9i0j</strong>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newSync.folder_name}
                      onChange={(e) => setNewSync({ ...newSync, folder_name: e.target.value })}
                      placeholder="Resumes 2025"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setSetupStep(3)}
                  disabled={!newSync.folder_id}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {setupStep === 3 && (
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Configure how often you want to sync this folder.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Frequency
                  </label>
                  <select
                    value={newSync.sync_frequency}
                    onChange={(e) => setNewSync({ ...newSync, sync_frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily (Every 24 hours)</option>
                    <option value="weekly">Weekly (Every 7 days)</option>
                    <option value="manual">Manual (Only when triggered)</option>
                  </select>
                </div>
                <button
                  onClick={handleSetupSync}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Complete Setup
                </button>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => {
                setShowSetupWizard(false);
                setSetupStep(1);
                setNewSync({ folder_id: '', folder_name: '', sync_frequency: 'daily' });
              }}
              className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveSetup;

