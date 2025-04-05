import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// Custom event for auth state changes
export const AUTH_CHANGE_EVENT = 'auth-state-changed';

// Publish auth state change event
export const publishAuthChange = (user: AuthResponse['user'] | null) => {
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGE_EVENT, { detail: { user } })
  );
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return handleAuthResponse(response.data);
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', credentials);
  return handleAuthResponse(response.data);
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  publishAuthChange(null);
};

export const handleGitHubLogin = (): void => {
  // Use our API route instead of direct GitHub URL
  // This route will handle the GitHub OAuth redirect
  window.location.href = '/api/auth/github';
};

export const getGitHubCallback = async (code: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/github/callback', { code });
  return handleAuthResponse(response.data);
};

const handleAuthResponse = (data: AuthResponse): AuthResponse => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Publish auth change event
  publishAuthChange(data.user);
  
  return data;
};

export const getCurrentUser = (): AuthResponse['user'] | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Failed to parse user data', error);
    return null;
  }
};

// Parse JWT token to get user data (can be used as fallback)
export const parseToken = (token: string): AuthResponse['user'] | null => {
  try {
    // Split the token and get the payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Helper function to initialize auth state when app loads
export const initAuthState = (): void => {
  const user = getCurrentUser();
  
  // If we have user data in localStorage, publish it
  if (user) {
    publishAuthChange(user);
  } 
  // Otherwise, try to parse from token
  else {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenUser = parseToken(token);
      if (tokenUser) {
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(tokenUser));
        publishAuthChange(tokenUser);
      } else {
        // Invalid token, clear auth state
        logout();
      }
    }
  }
}; 