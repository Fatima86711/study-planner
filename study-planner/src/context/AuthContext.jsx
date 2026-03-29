import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Context banao — baad mein useAuth mein use hoga
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true); // Pehli baar check kar raha hai

  // ── App Start Hone Par — Token Check Karo ──────────────────────────────────
  // Agar localStorage mein token hai toh user ko logged in rakho
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token');

      if (savedToken) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
        } catch (error) {
          // Token expired ya invalid — sab clear karo
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false); // Check complete
    };

    verifyToken();
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authService.login(email, password);

    // Token localStorage mein save karo
    localStorage.setItem('token', data.token);

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    return data;
  };

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {/* Loading ke waqt kuch mat dikhao — pehle token verify ho */}
      {!loading && children}
    </AuthContext.Provider>
  );
};