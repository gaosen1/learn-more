'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingDots } from '@/components/ui/loading';

// 分离实际处理逻辑的组件
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const isAuthRedirect = searchParams.get('auth_redirect');
    
    if (!token) {
      setError('No authentication token provided');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }
    
    try {
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Extract user info from token (JWT)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode JWT payload (middle part)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Get user info from payload
      const user = {
        id: payload.id,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        role: payload.role || 'STUDENT',
      };
      
      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set a flag for the header to detect auth change
      if (isAuthRedirect) {
        sessionStorage.setItem('auth_redirect', 'true');
      }
      
      console.log('Authentication successful, redirecting to dashboard...');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Error processing authentication response:', err);
      setError('Failed to process authentication response');
      
      // Redirect to login after a short delay
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        {error ? 'Authentication Error' : 'Authentication Successful'}
      </h1>
      
      {error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : (
        <>
          <p className="mb-4">You have been successfully authenticated.</p>
          <p className="mb-4">Redirecting to dashboard...</p>
        </>
      )}
      
      <div className="mt-4">
        <LoadingDots size="lg" />
      </div>
    </div>
  );
}

// 主页面组件用Suspense包裹内容组件
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <div className="mt-4">
          <LoadingDots size="lg" />
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 