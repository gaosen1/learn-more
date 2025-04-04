'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getCurrentUser, 
  AUTH_CHANGE_EVENT, 
  initAuthState, 
  isAuthenticated as checkAuth
} from '@/utils/auth';

interface UserContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true
});

export const useUser = () => useContext(UserContext);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Initialize auth state when component mounts
    const init = async () => {
      // Try to get current user from localStorage
      const user = getCurrentUser();
      const isAuth = checkAuth();
      
      setState({
        user,
        isAuthenticated: isAuth,
        isLoading: false
      });
      
      // Initialize auth state (will publish event if user exists)
      initAuthState();
    };
    
    init();
    
    // Listen for auth state changes
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const user = customEvent.detail?.user;
      
      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false
      });
    };
    
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}; 