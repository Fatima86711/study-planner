import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Use this hook in components to access auth context
// No need to import AuthContext directly
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default useAuth;