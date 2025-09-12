'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types/chat';
import {
  createUser,
  saveUserToStorage,
  getUserFromStorage,
  removeUserFromStorage,
  updateUserStatus,
  validateUsername,
} from '@/lib/auth';

interface AuthContextType {
  state: AuthState;
  login: (username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateStatus: (status: User['status']) => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_STATUS'; payload: User['status'] };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_STATUS':
      if (!state.user) return state;
      return {
        ...state,
        user: updateUserStatus(state.user, action.payload),
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = getUserFromStorage();
        if (savedUser) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: savedUser });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Handle browser visibility change to update user status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (state.user) {
        const newStatus = document.hidden ? 'away' : 'online';
        dispatch({ type: 'UPDATE_STATUS', payload: newStatus });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.user]);

  // Update user status to offline before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.user) {
        updateUserStatus(state.user, 'offline');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.user]);

  const login = async (username: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const validationError = validateUsername(username);
      if (validationError) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: validationError };
      }

      const user = createUser(username);
      saveUserToStorage(user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Failed to login. Please try again.' };
    }
  };

  const logout = () => {
    if (state.user) {
      updateUserStatus(state.user, 'offline');
    }
    removeUserFromStorage();
    dispatch({ type: 'LOGOUT' });
  };

  const updateStatus = (status: User['status']) => {
    dispatch({ type: 'UPDATE_STATUS', payload: status });
  };

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    updateStatus,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}