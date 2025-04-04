'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { parseToken, publishAuthChange } from '@/utils/auth';
import { LoadingSpinner } from '@/components/ui/loading';
import styles from './page.module.css';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Authenticating...');
  const processedRef = useRef(false);
  const errorShownRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions of this effect
    if (processedRef.current) return;
    processedRef.current = true;
    
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('Authentication failed');
      if (!errorShownRef.current) {
        errorShownRef.current = true;
        toast({
          title: 'Login failure',
          description: 'Authentication token missing or invalid',
          type: 'error'
        });
      }
      
      // Redirect with a short delay to ensure toast is shown
      setTimeout(() => {
        router.push('/login?error=auth_failed');
      }, 100);
      
      return;
    }
    
    try {
      setStatus('Verifying credentials...');
      
      // Save token to local storage
      localStorage.setItem('token', token);
      
      // Parse token and extract user data
      const userData = parseToken(token);
      if (userData) {
        // Save user data to local storage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Emit auth change event to update UI immediately
        publishAuthChange(userData);
        setStatus(`Welcome${userData?.name ? ', ' + userData.name : ''}!`);
      }
      
      // Show success message only once
      if (!errorShownRef.current) {
        errorShownRef.current = true;
        toast({
          title: 'Login successful',
          description: `Welcome${userData?.name ? ', ' + userData.name : ''}! You've successfully logged in via GitHub.`,
          type: 'success'
        });
      }
      
      // Redirect with a short delay to ensure toast is shown
      setTimeout(() => {
        router.push('/');
      }, 800); // Longer delay to ensure user sees the welcome message
    } catch (error) {
      console.error('Error processing authentication:', error);
      setStatus('Authentication error');
      
      if (!errorShownRef.current) {
        errorShownRef.current = true;
        toast({
          title: 'Login error',
          description: 'An error occurred while processing your login',
          type: 'error'
        });
      }
      
      setTimeout(() => {
        router.push('/login?error=processing_error');
      }, 100);
    }
  }, [router, searchParams]); // Keep toast out of dependencies

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <LoadingSpinner size="lg" text={status} />
        
        <p className={styles.redirectText}>
          You'll be redirected automatically once the process is complete.
        </p>
      </div>
    </div>
  );
} 