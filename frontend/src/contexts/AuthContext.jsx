import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('flms_token');
    if (token) {
      api
        .get('/auth/profile')
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('flms_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('flms_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('flms_token');
    setUser(null);
  };

  const updateUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
