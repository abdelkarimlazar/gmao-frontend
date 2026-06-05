import axios from 'axios';

/* ==========================================
   CONFIGURATION
========================================== */

export const AUTH_STORAGE_KEY = 'gmao_jwt_token';

export const DEFAULT_API_BASE_URL = 'http://localhost:5268/api';

/* ==========================================
   URL HELPER
========================================== */

const normalizeApiBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  return value.replace(/\/+$/, '');
};

/* ==========================================
   TOKEN STORAGE
========================================== */

export const getStoredToken = () => {
  return localStorage.getItem(AUTH_STORAGE_KEY);
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

/* ==========================================
   API URL
========================================== */

const envApiBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

let resolvedApiBaseUrl = envApiBaseUrl || DEFAULT_API_BASE_URL;

export const getApiBaseUrl = () => {
  return resolvedApiBaseUrl;
};

export const setApiBaseUrl = (baseUrl) => {
  const normalized = normalizeApiBaseUrl(baseUrl);

  resolvedApiBaseUrl = normalized || envApiBaseUrl || DEFAULT_API_BASE_URL;

  api.defaults.baseURL = resolvedApiBaseUrl;
};

/* ==========================================
   AXIOS INSTANCE
========================================== */

const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ==========================================
   REQUEST INTERCEPTOR
========================================== */

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    config.baseURL = normalizeApiBaseUrl(config.baseURL) || resolvedApiBaseUrl;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ==========================================
   RESPONSE INTERCEPTOR
========================================== */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      setStoredToken(null);

      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (!error.response) {
      console.error('Impossible de contacter le serveur.');
    }

    return Promise.reject(error);
  }
);

export default api;