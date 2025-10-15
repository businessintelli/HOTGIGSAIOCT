import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Star, Save, X, Filter, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdvancedSearch({ onResultsUpdate }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);

  // Search filters
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    work_model: '',
    employment_type: '',
    experience_level: '',
    min_salary: '',
    max_salary: '',
    skills: '',
    posted_after: ''
  });

  // Save search state
  const [searchName, setSearchName] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('daily');

  useEffect(() => {
    if (user) {
      loadSavedSearches();
    }
  }, [user]);

  const loadSavedSearches = async () => {
    try {
      const response = await api.get('/search/saved-searches');
      setSavedSearches(response.data);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          if (key === 'skills') {
            params[key] = filters[key].split(',').map(s => s.trim());
          } else {
            params[key] = filters[key];
          }
        }
      });

      const response = await api.get('/search/jobs', { params });
      if (onResultsUpdate) {
        onResultsUpdate(response.data);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    try {
      await api.post('/search/saved-searches', {
        name: searchName,
        filters: filters,
        alert_frequency: alertFrequency,
        is_active: true
      });
      
      setShowSaveSearch(false);
      setSearchName('');
      loadSavedSearches();
      alert('Search saved successfully!');
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search');
    }
  };

  const loadSavedSearch = (search) => {
    setFilters(search.filters);
    handleSearch();
  };

  const deleteSavedSearch = async (searchId) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      await api.delete(`/search/saved-searches/${searchId}`);
      loadSavedSearches();
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      work_model: '',
      employment_type: '',
      experience_level: '',
      min_salary: '',
      max_salary: '',
      skills: '',
      posted_after: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs by title, skills, or keywords..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="City, State, or Remote"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Work Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Work Model
              </label>
              <select
                value={filters.work_model}
                onChange={(e) => setFilters({ ...filters, work_model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={filters.employment_type}
                onChange={(e) => setFilters({ ...filters, employment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experience_level}
                onChange={(e) => setFilters({ ...filters, experience_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Min Salary
              </label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={filters.min_salary}
                onChange={(e) => setFilters({ ...filters, min_salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Max Salary
              </label>
              <input
                type="number"
                placeholder="e.g., 150000"
                value={filters.max_salary}
                onChange={(e) => setFilters({ ...filters, max_salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Skills */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., React, Python, AWS"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Posted After */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posted After
              </label>
              <select
                value={filters.posted_after}
                onChange={(e) => setFilters({ ...filters, posted_after: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear all filters
            </button>

            {user && (
              <button
                onClick={() => setShowSaveSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save this search
              </button>
            )}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {user && savedSearches.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 mt-4">Saved Searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group"
              >
                <button
                  onClick={() => loadSavedSearch(search)}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {search.name}
                </button>
                <button
                  onClick={() => deleteSavedSearch(search.id)}
                  className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearch && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSaveSearch(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Save Search</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior React Developer in SF"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Frequency
                </label>
                <select
                  value={alertFrequency}
                  onChange={(e) => setAlertFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveSearch(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Search
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

