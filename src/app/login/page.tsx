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
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 基本验证
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      // 在真实应用中，这里应该是登录API调用
      // 这里我们模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟登录成功
      // 生成一个假的token并存储到localStorage
      const fakeToken = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userToken', fakeToken);
      
      // 如果勾选了"记住我"，可以设置更长时间的token有效期
      if (formData.rememberMe) {
        // 在实际应用中，可能需要设置token的过期时间或其他逻辑
        localStorage.setItem('rememberMe', 'true');
      }
      
      console.log('Login successful, token:', fakeToken);
      
      // 重定向到仪表板页面
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
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
              
              <button 
                type="submit" 
                className={`btn btn-primary ${styles.submitButton}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
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