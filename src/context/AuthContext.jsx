import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getStoredToken, setStoredToken } from '../api/axiosConfig';
import { useToast } from '../components/ToastContext';
import { loginRequest, registerRequest } from '../services/authService';
import { extractPayload } from '../services/apiUtils';

const AuthContext = createContext(null);

const roleClaimKeys = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

const readRole = (decodedToken) => {
  for (const key of roleClaimKeys) {
    const value = decodedToken?.[key];

    if (Array.isArray(value) && value.length > 0) {
      return value.join(', ');
    }

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return 'Utilisateur';
};

const isTokenExpired = (decodedToken) => {
  if (!decodedToken?.exp) {
    return false;
  }

  return decodedToken.exp * 1000 <= Date.now();
};

const buildUserFromToken = (token, payload = {}) => {
  try {
    const decoded = jwtDecode(token);

    if (isTokenExpired(decoded)) {
      return null;
    }

    const data = extractPayload(payload);
    const apiUser = data?.user || data;
    return {
      id: decoded.sub || decoded.nameid || apiUser?.id || apiUser?.userId || null,
      name: decoded.name || decoded.unique_name || apiUser?.name || apiUser?.fullName || apiUser?.userName || decoded.email || 'Utilisateur GMAO',
      email: decoded.email || apiUser?.email || '',
      role: readRole(decoded),
    };
  } catch (error) {
    const apiUser = payload?.user || payload;
    return {
      id: apiUser?.id || apiUser?.userId || null,
      name: apiUser?.name || apiUser?.fullName || apiUser?.userName || 'Utilisateur GMAO',
      email: apiUser?.email || '',
      role: apiUser?.role || 'Administrateur',
    };
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const clearSession = useCallback(() => {
    localStorage.removeItem('gmao_jwt_token');

    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (getStoredToken()) {
        pushToast({
          title: 'Session invalide',
          message: 'Votre session a ete fermee car le backend a retourne une reponse non autorisee.',
          tone: 'warning',
        });
      }

      clearSession();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const existingToken = getStoredToken();

    if (!existingToken) {
      setLoading(false);
      return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }

    const restoredUser = buildUserFromToken(existingToken);

    if (!restoredUser) {
      clearSession();
      setLoading(false);
      return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }

    setToken(existingToken);
    setUser(restoredUser);
    setLoading(false);

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearSession, pushToast]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let decoded;

    try {
      decoded = jwtDecode(token);
    } catch (error) {
      clearSession();
      return undefined;
    }

    if (isTokenExpired(decoded)) {
      clearSession();
      pushToast({
        title: 'Session expiree',
        message: 'Reconnectez-vous pour continuer a utiliser l application.',
        tone: 'warning',
      });
      return undefined;
    }

    if (!decoded?.exp) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      clearSession();
      pushToast({
        title: 'Session expiree',
        message: 'Votre token JWT a expire. La session a ete fermee automatiquement.',
        tone: 'warning',
      });
    }, decoded.exp * 1000 - Date.now());

    return () => window.clearTimeout(timeout);
  }, [clearSession, pushToast, token]);

const login = useCallback(async (credentials) => {
  const response = await loginRequest(credentials);

  if (!response.token) {
    throw new Error('La reponse du backend ne contient pas de token JWT.');
  }

  const nextUser = buildUserFromToken(
    response.token,
    response.payload
  );

  if (!nextUser) {
    throw new Error('Token JWT invalide.');
  }

  setStoredToken(response.token);
  setToken(response.token);
  setUser(nextUser);

  return nextUser;
}, []);

  const register = useCallback(async (registrationData) => {
    const response = await registerRequest(registrationData);

    if (response.token) {
      const nextUser = buildUserFromToken(response.token, response.payload);

      setStoredToken(response.token);
      setToken(response.token);
      setUser(nextUser);

      return { autoLoggedIn: true, user: nextUser };
    }

    return { autoLoggedIn: false, payload: response.payload };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    window.location.href = '/login';
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [loading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit etre utilise dans AuthProvider.');
  }

  return context;
};