import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_session') || 'null');
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const saveResponse = (response) => {
    const nextSession = {
      token: response.data.session?.access_token || 'demo-user-token',
      user: {
        id: response.data.user_id,
        email: response.data.email,
        full_name: response.data.full_name,
        role: response.data.role || 'candidate'
      }
    };
    localStorage.setItem('matchpoint_session', JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  };

  const login = async (credentials) => saveResponse(await authApi.login(credentials));
  const register = async (details) => saveResponse(await authApi.register(details));
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('matchpoint_session');
      setSession(null);
    }
  };

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    login,
    register,
    logout
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
