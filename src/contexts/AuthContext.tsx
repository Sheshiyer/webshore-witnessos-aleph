'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient } from '@/utils/api-client';

// Types
interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  verified: boolean;
  preferences: any;
  has_completed_onboarding?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Actions
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Storage helpers
const TOKEN_KEY = 'witnessos_token';
const USER_KEY = 'witnessos_user';

function saveAuthData(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    apiClient.setAuthToken(token);
  }
}

function loadAuthData(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  
  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing stored user data:', e);
      localStorage.removeItem(USER_KEY);
    }
  }
  
  return { token, user };
}

function clearAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    apiClient.clearAuthToken();
  }
}

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const { token, user } = loadAuthData();

      if (token && user) {
        // Set token for API client
        apiClient.setAuthToken(token);

        // Validate token with backend
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token }
            });
          } else {
            // Token invalid, clear stored data
            clearAuthData();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } catch (error) {
          console.error('Token validation error:', error);
          clearAuthData();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Handle token expiration events from API client
    const handleTokenExpired = () => {
      console.log('🚨 Token expired event received');
      clearAuthData();
      dispatch({ type: 'AUTH_LOGOUT' });
    };

    // Handle user refresh events (e.g., after profile upload)
    const handleUserRefresh = async () => {
      console.log('🔄 User refresh event received');
      const { token } = loadAuthData();
      if (token && state.isAuthenticated) {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            // Update user data in state and localStorage
            saveAuthData(token, response.data);
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token }
            });
            console.log('✅ User data refreshed successfully');
          }
        } catch (error) {
          console.error('User refresh error:', error);
        }
      }
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:refresh-user', handleUserRefresh);
    initializeAuth();

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:refresh-user', handleUserRefresh);
    };
  }, [state.isAuthenticated]);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('🔐 Attempting login...');
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        // Backend returns normalized { token, user, message } format
        const { token, user } = response.data;
        
        if (token && user) {
          console.log('✨ Login successful, saving auth data');
          saveAuthData(token, user);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
          return { success: true };
        } else {
          console.error('🚨 Login response missing token or user data');
          const error = 'Invalid authentication response';
          dispatch({ type: 'AUTH_ERROR', payload: error });
          return { success: false, error };
        }
      } else {
        console.error('🚨 Login failed:', response.error || response.message);
        const error = response.error || response.message || 'Login failed';
        dispatch({ type: 'AUTH_ERROR', payload: error });
        return { success: false, error };
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await apiClient.register(email, password, name);
      
      if (response.success) {
        // Auto-login after successful registration
        return await login(email, password);
      } else {
        const error = response.error || 'Registration failed';
        dispatch({ type: 'AUTH_ERROR', payload: error });
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    clearAuthData();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 