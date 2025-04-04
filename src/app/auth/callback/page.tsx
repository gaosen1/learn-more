'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      toast({
        title: 'Login failure',
        description: 'Authentication token missing or invalid',
        type: 'error'
      });
      router.push('/login?error=auth_failed');
      return;
    }
    
    // 保存令牌到本地存储
    localStorage.setItem('token', token);
    
    // 可选：获取用户信息，但这里我们假设令牌已包含必要信息
    
    // 显示成功消息
    toast({
      title: 'Login successful',
      description: 'You have successfully logged in via GitHub',
      type: 'success'
    });
    
    // 重定向到主页或之前的页面
    router.push('/');
    
  }, [router, searchParams, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mb-4">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Logging in...</h1>
        <p className="text-gray-600">Please wait, we are completing the login process.</p>
      </div>
    </div>
  );
} 