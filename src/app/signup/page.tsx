'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
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
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Registration logic would go here
    console.log('Signup data:', formData);
    
    // Simulate successful registration
    router.push('/dashboard');
  };

  return (
    <MainLayout>
      <div className={styles.signup}>
        <div className="container">
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Sign Up</h1>
              <p className={styles.subtitle}>Create your LearnMore account</p>
            </div>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Your full name"
                  required
                />
              </div>
              
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
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <div className={styles.terms}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className={styles.checkbox}
                    required
                  />
                  <span>
                    I agree to LearnMore's{' '}
                    <Link href="/terms" className={styles.termsLink}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className={styles.termsLink}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
              
              <button type="submit" className={`btn btn-primary ${styles.submitButton}`}>
                Sign Up
              </button>
            </form>
            
            <div className={styles.formFooter}>
              <p>
                Already have an account?{' '}
                <Link href="/login" className={styles.loginLink}>
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 