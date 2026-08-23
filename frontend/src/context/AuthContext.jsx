import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const handleOAuthRedirect = () => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken) {
      const payload = parseJwt(accessToken);
      if (payload) {
        const userMeta = payload.user_metadata || {};
        const session = {
          token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: payload.sub || payload.id,
            email: payload.email || userMeta.email || '',
            full_name: userMeta.full_name || userMeta.name || payload.email?.split('@')[0] || 'Candidate',
            role: userMeta.role || 'candidate',
            avatar_url: userMeta.avatar_url || userMeta.picture || ''
          }
        };
        localStorage.setItem('matchpoint_session', JSON.stringify(session));
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return session;
      }
    }
  }
  return null;
};

const readSession = () => {
  try {
    const oauthSession = handleOAuthRedirect();
    if (oauthSession) return oauthSession;
    return JSON.parse(localStorage.getItem('matchpoint_session') || 'null');
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    const oauthSession = handleOAuthRedirect();
    if (oauthSession) {
      setSession(oauthSession);
    }
  }, []);

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

  const loginWithGoogle = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fvouskxnulcmjklgmwau.supabase.co';
    const redirectTo = `${window.location.origin}/dashboard`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  const updateUser = (nextUserData) => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        user: {
          ...prev.user,
          ...nextUserData
        }
      };
      try {
        localStorage.setItem('matchpoint_session', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save updated session', err);
      }
      return updated;
    });
  };

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
    loginWithGoogle,
    updateUser,
    logout
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
