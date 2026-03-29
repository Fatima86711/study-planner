import api from './api';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

const authService = { register, login, getMe };

export default authService;