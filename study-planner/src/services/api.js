import axios from 'axios';

// Axios instance — base URL .env se aayegi
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Har request se pehle — token automatically header mein lagao
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