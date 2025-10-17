// API Configuration
// Centralized API URL configuration for the entire application

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_URL = `${API_BASE_URL}/api`;

// Helper to build full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};

// Helper to build admin API URLs
export const getAdminApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/admin/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  API_URL,
  getApiUrl,
  getAdminApiUrl
};

