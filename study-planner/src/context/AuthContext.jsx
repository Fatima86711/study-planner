import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create context — used in useAuth hook
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true); // Pehli baar check kar raha hai

  // ── On app start, verify token ─────────────────────────────────────────────
  // If token exists in localStorage, keep user logged in
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token');

      if (savedToken) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
        } catch (error) {
          // Token expired or invalid — clear auth data
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
      {/* Don't render until loading is complete and token verification is done */}
      {!loading && children}
    </AuthContext.Provider>
  );
};