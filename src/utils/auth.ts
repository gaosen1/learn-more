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
    id: string;
    name: string;
    email: string;
  };
}

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
};

export const handleGitHubLogin = (): void => {
  const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
  const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback';
  
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email`;
};

export const getGitHubCallback = async (code: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/github/callback', { code });
  return handleAuthResponse(response.data);
};

const handleAuthResponse = (data: AuthResponse): AuthResponse => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const getCurrentUser = (): { id: string; name: string; email: string } | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Failed to parse user data', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
}; 