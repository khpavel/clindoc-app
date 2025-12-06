import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { login as loginApi } from '../api/authApi';
import type { LoginPayload, TokenResponse } from '../types/auth';
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
} from './tokenStorage';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const navigate = useNavigate();

  // Ensure token state matches storage on mount
  useEffect(() => {
    const storedToken = getAccessToken();
    if (storedToken !== token) {
      setToken(storedToken);
    }
    // We intentionally only want this to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (payload: LoginPayload): Promise<void> => {
    const response: TokenResponse = await loginApi(payload);
    const accessToken = response.access_token;

    setAccessToken(accessToken);
    setToken(accessToken);
  };

  const handleLogout = (): void => {
    clearTokens();
    setToken(null);
    navigate('/login');
  };

  const value: AuthContextValue = {
    token,
    // Always check the actual token in storage to ensure consistency
    // This handles cases where token is cleared externally (e.g., 401 error in httpClient)
    isAuthenticated: !!getAccessToken(),
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;


