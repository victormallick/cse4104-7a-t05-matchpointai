import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi } from '../services/api';
import { clearUserStorage } from '../utils/storage';

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
  if (hash) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const error = params.get('error') || params.get('error_code');
    const type = params.get('type');
    const accessToken = params.get('access_token');

    // If link is expired or invalid, forward cleanly to forgot-password with friendly message
    if (error) {
      if (!window.location.pathname.includes('/forgot-password')) {
        window.location.href = '/forgot-password?expired=true';
      }
      return null;
    }

    // If this is a password recovery link, route directly to /reset-password
    if (type === 'recovery' && accessToken) {
      if (!window.location.pathname.includes('/reset-password')) {
        window.location.href = `/reset-password${hash}`;
      }
      return null;
    }

    if (accessToken && type !== 'recovery') {
      const refreshToken = params.get('refresh_token');
      const payload = parseJwt(accessToken);
      if (payload) {
        const nextUserId = payload.sub || payload.id;
        try {
          const prevSession = JSON.parse(localStorage.getItem('matchpoint_session') || 'null');
          if (prevSession?.user?.id && prevSession.user.id !== nextUserId) {
            clearUserStorage();
          }
        } catch {}

        const userMeta = payload.user_metadata || {};
        let initialFullName = userMeta.full_name || userMeta.name || payload.email?.split('@')[0] || 'Candidate';
        try {
          const cachedSession = JSON.parse(localStorage.getItem('matchpoint_session') || 'null');
          if (cachedSession?.user?.email === payload.email && cachedSession?.user?.full_name) {
            initialFullName = cachedSession.user.full_name;
          }
        } catch {}

        const session = {
          token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: nextUserId,
            email: payload.email || userMeta.email || '',
            full_name: initialFullName,
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

  const updateUser = useCallback((nextUserData) => {
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
  }, []);

  useEffect(() => {
    const oauthSession = handleOAuthRedirect();
    if (oauthSession) {
      setSession(oauthSession);
    }
  }, []);

  // Synchronize latest custom saved full_name from database if user edited it previously
  useEffect(() => {
    if (session?.token) {
      userApi.profile()
        .then((res) => {
          if (res?.data?.full_name && res.data.full_name !== session.user?.full_name) {
            updateUser({ full_name: res.data.full_name });
          }
        })
        .catch(() => {});
    }
  }, [session?.token, updateUser]);

  const saveResponse = (response) => {
    const nextUserId = response.data.user_id;
    try {
      const prevSession = JSON.parse(localStorage.getItem('matchpoint_session') || 'null');
      if (prevSession?.user?.id && prevSession.user.id !== nextUserId) {
        clearUserStorage();
      }
    } catch {}

    const nextSession = {
      token: response.data.session?.access_token || 'demo-user-token',
      user: {
        id: nextUserId,
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

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('matchpoint_session');
      clearUserStorage();
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
  }), [session, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
