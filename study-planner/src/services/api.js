import axios from 'axios';

// Axios instance — base URL comes from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Before each request — attach token automatically to header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;