import React, { useState, useEffect } from 'react';
import {
  Settings, Plus, Edit, Trash2, Search, Filter, Save, X, Eye, EyeOff, AlertCircle
} from 'lucide-react';

const Configuration = () => {
  const [configs, setConfigs] = useState([]);
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: 'system',
    value_type: 'string',
    description: '',
    is_secret: false
  });

  const categories = ['all', 'email', 'database', 'authentication', 'api_keys', 'features', 'system'];
  const valueTypes = ['string', 'number', 'boolean', 'json', 'secret'];

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    filterConfigs();
  }, [configs, searchTerm, categoryFilter]);

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  };

  const filterConfigs = () => {
    let filtered = configs;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    setFilteredConfigs(filtered);
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      key: '',
      value: '',
      category: 'system',
      value_type: 'string',
      description: '',
      is_secret: false
    });
    setShowModal(true);
  };

  const handleEdit = (config) => {
    setModalMode('edit');
    setSelectedConfig(config);
    setFormData({
      key: config.key,
      value: config.value === '********' ? '' : config.value,
      category: config.category,
      value_type: config.value_type,
      description: config.description || '',
      is_secret: config.is_secret
    });
    setShowModal(true);
  };

  const handleDelete = async (config) => {
    if (!confirm(`Are you sure you want to delete "${config.key}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:8000/api/admin/config/${config.key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const url = modalMode === 'create'
        ? 'http://localhost:8000/api/admin/config'
        : `http://localhost:8000/api/admin/config/${selectedConfig.key}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      setShowModal(false);
      fetchConfigs();
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const toggleSecretVisibility = (key) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h1>
          <p className="text-gray-600">Manage environment variables and application settings</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Configuration
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-900">Important Notice</p>
          <p className="text-sm text-yellow-800 mt-1">
            Changes to configuration values may require application restart to take effect. 
            Be careful when modifying critical settings.
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
              placeholder="Search configuration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Configuration Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Key</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredConfigs.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{config.key}</p>
                    {config.description && (
                      <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {config.is_secret ? (
                      <>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {showSecrets[config.key] ? config.value : '********'}
                        </code>
                        <button
                          onClick={() => toggleSecretVisibility(config.key)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {showSecrets[config.key] ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </>
                    ) : (
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {config.value}
                      </code>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(config.category)}`}>
                    {config.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{config.value_type}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {config.is_editable && (
                      <>
                        <button
                          onClick={() => handleEdit(config)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(config)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {!config.is_editable && (
                      <span className="text-xs text-gray-500 italic">Read-only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredConfigs.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No configuration found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add Configuration' : 'Edit Configuration'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  disabled={modalMode === 'edit'}
                  required
                  placeholder="RESEND_API_KEY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value Type</label>
                  <select
                    value={formData.value_type}
                    onChange={(e) => setFormData({ ...formData, value_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {valueTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  type={formData.is_secret ? 'password' : 'text'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_secret"
                  checked={formData.is_secret}
                  onChange={(e) => setFormData({ ...formData, is_secret: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_secret" className="text-sm font-medium text-gray-700">
                  This is a secret value (will be masked in the UI)
                </label>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {modalMode === 'create' ? 'Create Configuration' : 'Update Configuration'}
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

export default Configuration;

