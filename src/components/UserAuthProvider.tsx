'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getCurrentUser, 
  AUTH_CHANGE_EVENT, 
  initAuthState, 
  isAuthenticated as checkAuth,
  publishAuthChange
} from '@/utils/auth';

interface UserContextType {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: () => {}
});

export const useUser = () => useContext(UserContext);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    refreshAuth: () => {}
  });

  const refreshAuth = () => {
    const user = getCurrentUser();
    const isAuth = checkAuth();
    
    if (user && isAuth) {
      setState(prevState => ({
        ...prevState,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
      
      publishAuthChange(user);
      console.log('Auth state refreshed successfully');
    } else {
      console.log('Failed to refresh auth state - user or token missing');
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = getCurrentUser();
      const isAuth = checkAuth();
      
      setState({
        user,
        isAuthenticated: isAuth,
        isLoading: false,
        refreshAuth
      });
      
      initAuthState();
    };
    
    init();
    
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const user = customEvent.detail?.user;
      
      setState(prevState => ({
        ...prevState,
        user,
        isAuthenticated: !!user,
        isLoading: false
      }));
    };
    
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      refreshAuth
    }));
  }, []);

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}; 