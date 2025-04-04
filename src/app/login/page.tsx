'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic would go here
    // This is just sample code - implement actual login in a real app
    console.log('Login data:', formData);
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Simulate successful login
    router.push('/dashboard');
  };

  return (
    <MainLayout>
      <div className={styles.login}>
        <div className="container">
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Login</h1>
              <p className={styles.subtitle}>Sign in to your LearnMore account</p>
            </div>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Your email address"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Your password"
                  required
                />
              </div>
              
              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>
              
              <button type="submit" className={`btn btn-primary ${styles.submitButton}`}>
                Login
              </button>
            </form>
            
            <div className={styles.formFooter}>
              <p>
                Don't have an account?{' '}
                <Link href="/signup" className={styles.signupLink}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 