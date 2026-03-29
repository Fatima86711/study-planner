import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Har component mein seedha useAuth() likhenge
// AuthContext import karne ki zarurat nahi
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default useAuth;