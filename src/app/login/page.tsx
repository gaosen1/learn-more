'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';
import api from "@/utils/api";
import { login, handleGitHubLogin } from "@/utils/auth";
import { useToast } from "@/components/ui/toast";
import { FaGithub } from "react-icons/fa";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 检查URL中是否有错误参数
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'github_auth_failed') {
        setError('GitHub authentication failed. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    }
  }, [searchParams]);

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
      await login({
        email: formData.email,
        password: formData.password,
      });
      router.push('/');
      toast({
        title: "Login successful",
        description: "Welcome back!",
        type: "success"
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password",
        type: "error"
      });
      setError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理GitHub登录
  const handleGitHubLoginClick = () => {
    // 使用auth.ts中封装的GitHub登录函数
    handleGitHubLogin();
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
                <Input
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
                <Input
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
              
              <Button 
                type="submit" 
                className={`${styles.submitButton}`}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Login
              </Button>
            </form>
            
            <div className={styles.socialLogin}>
              <div className={styles.divider}>
                <span className={styles.dividerText}>OR</span>
              </div>
              
              <div className={styles.socialLoginContainer}>
                <Button 
                  className={styles.githubButton}
                  onClick={handleGitHubLoginClick}
                  type="button"
                  variant="github"
                >
                  <FaGithub className={styles.githubIcon} />
                  Continue with GitHub
                </Button>
              </div>
            </div>
            
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