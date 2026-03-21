import React, { useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, setAuthToken, clearAuthToken, type User, type LoginResponse, type UserStatus } from '../services/api';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; token: string; user: User };

type AuthContextValue = {
  state: AuthState;
  login: (email: string, password: string) => Promise<LoginResponse>;
  socialLogin: (provider: 'google' | 'apple', email: string, fullName?: string) => Promise<LoginResponse>;
  checkStatus: () => Promise<UserStatus>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  // Restore session on mount
  useEffect(() => {
    AsyncStorage.multiGet([TOKEN_KEY, USER_KEY])
      .then(([[, token], [, userJson]]) => {
        if (token && userJson) {
          const user = JSON.parse(userJson) as User;
          setAuthToken(token);
          setState({ status: 'authenticated', token, user });
        } else {
          setState({ status: 'unauthenticated' });
        }
      })
      .catch(() => setState({ status: 'unauthenticated' }));
  }, []);

  const _saveSession = useCallback(async (token: string, user: User) => {
    setAuthToken(token);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
    setState({ status: 'authenticated', token, user });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    const result = await auth.login(email, password);
    await _saveSession(result.token, result.user);
    return result;
  }, [_saveSession]);

  const socialLogin = useCallback(async (
    provider: 'google' | 'apple',
    email: string,
    fullName?: string,
  ): Promise<LoginResponse> => {
    const fn = provider === 'google' ? auth.googleAuth : auth.appleAuth;
    const result = await fn(email, fullName);
    await _saveSession(result.token, result.user);
    return result;
  }, [_saveSession]);

  const checkStatus = useCallback(async (): Promise<UserStatus> => {
    const result = await auth.checkStatus();
    // Update cached user with new status
    if (state.status === 'authenticated') {
      const updatedUser = { ...state.user, status: result.status };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setState({ ...state, user: updatedUser });
    }
    return result.status;
  }, [state]);

  const updateUser = useCallback((user: User) => {
    if (state.status === 'authenticated') {
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ ...state, user });
    }
  }, [state]);

  const logout = useCallback(async () => {
    clearAuthToken();
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setState({ status: 'unauthenticated' });
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { state, login, socialLogin, checkStatus, updateUser, logout } },
    children
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
