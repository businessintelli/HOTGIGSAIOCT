import React, { useState, useEffect } from 'react';
import { getAdminApiUrl } from '../../config/api';
import {
  Key, Plus, Trash2, Search, Filter, Save, X, Eye, EyeOff, Copy, CheckCircle, AlertCircle
} from 'lucide-react';

const APIKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [filteredKeys, setFilteredKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showKeyValues, setShowKeyValues] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    service: '',
    key_value: '',
    description: '',
    environment: 'production'
  });

  const services = ['all', 'resend', 'openai', 'stripe', 'twilio', 'aws', 'google', 'other'];
  const environments = ['production', 'staging', 'development'];

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  useEffect(() => {
    filterKeys();
  }, [apiKeys, searchTerm, serviceFilter]);

  const fetchAPIKeys = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getAdminApiUrl('api-keys'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const filterKeys = () => {
    let filtered = apiKeys;

    if (searchTerm) {
      filtered = filtered.filter(k =>
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(k => k.service === serviceFilter);
    }

    setFilteredKeys(filtered);
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      service: '',
      key_value: '',
      description: '',
      environment: 'production'
    });
    setShowModal(true);
  };

  const handleDelete = async (apiKey) => {
    if (!confirm(`Are you sure you want to delete "${apiKey.name}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(getAdminApiUrl(`api-keys/${apiKey.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchAPIKeys();
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(getAdminApiUrl('api-keys'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      setShowModal(false);
      fetchAPIKeys();
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  const toggleKeyVisibility = (id) => {
    setShowKeyValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getServiceIcon = (service) => {
    const icons = {
      resend: '📧',
      openai: '🤖',
      stripe: '💳',
      twilio: '📱',
      aws: '☁️',
      google: '🔍',
      other: '🔑'
    };
    return icons[service] || icons.other;
  };

  const getEnvironmentColor = (env) => {
    const colors = {
      production: 'bg-green-100 text-green-800',
      staging: 'bg-yellow-100 text-yellow-800',
      development: 'bg-blue-100 text-blue-800'
    };
    return colors[env] || colors.production;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
          <p className="text-gray-600">Manage API keys for external services</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add API Key
        </button>
      </div>

      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-900">Security Notice</p>
          <p className="text-sm text-red-800 mt-1">
            API keys are sensitive credentials. Never share them publicly or commit them to version control.
            Store them securely and rotate them regularly.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search API keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {services.map(service => (
                <option key={service} value={service}>
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getServiceIcon(apiKey.service)}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{apiKey.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{apiKey.service}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEnvironmentColor(apiKey.environment)}`}>
                {apiKey.environment}
              </span>
            </div>

            {apiKey.description && (
              <p className="text-sm text-gray-600 mb-4">{apiKey.description}</p>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">API Key</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title={showKeyValues[apiKey.id] ? 'Hide' : 'Show'}
                  >
                    {showKeyValues[apiKey.id] ? (
                      <EyeOff className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key_value, apiKey.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedKey === apiKey.id ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <code className="text-xs bg-white px-2 py-1 rounded font-mono block overflow-x-auto">
                {showKeyValues[apiKey.id] 
                  ? apiKey.key_value 
                  : `${apiKey.key_prefix}${'*'.repeat(32)}`
                }
              </code>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div>
                <span className="font-medium">Last used:</span>{' '}
                {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : 'Never'}
              </div>
              <div>
                <span className="font-medium">Usage:</span> {apiKey.usage_count} times
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(apiKey)}
                className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No API keys found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add API Key</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Production Resend API Key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select service...</option>
                    {services.filter(s => s !== 'all').map(service => (
                      <option key={service} value={service}>
                        {service.charAt(0).toUpperCase() + service.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {environments.map(env => (
                      <option key={env} value={env}>
                        {env.charAt(0).toUpperCase() + env.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key Value</label>
                <input
                  type="password"
                  value={formData.key_value}
                  onChange={(e) => setFormData({ ...formData, key_value: e.target.value })}
                  required
                  placeholder="sk_live_..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Used for sending transactional emails..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Add API Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIKeys;

