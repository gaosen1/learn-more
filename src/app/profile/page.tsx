'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
        setFormData({
          ...formData,
          name: data.user.name,
          email: data.user.email,
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 这里将实现更新用户资料的API调用
      // 现在仅展示界面
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 这里将实现更改密码的API调用
      // 现在仅展示界面
      setMessage({ 
        type: 'success', 
        text: 'Password updated successfully!' 
      });
      
      // 清空密码字段
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update password. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAvatar = () => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.name} className={styles.avatarImage} />;
    }
    return user?.name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.profileContainer}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className={styles.profileContainer}>
          <div className={styles.error}>{error || 'Failed to load profile'}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.profileContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Profile</h1>
          <p className={styles.subtitle}>Manage your account information and settings</p>
        </div>
        
        {message.text && (
          <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
            {message.text}
          </div>
        )}
        
        <div className={styles.profileGrid}>
          <div className={styles.card}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {renderAvatar()}
              </div>
              <div className={styles.avatarInfo}>
                <h3 className={styles.userName}>{user.name}</h3>
                <span className={styles.userRole}>{user.role.toLowerCase()}</span>
              </div>
              <button className={styles.secondaryButton}>Change Avatar</button>
            </div>
          </div>
          
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Personal Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className={styles.button}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
            
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Change Password</h2>
              <form onSubmit={handlePasswordUpdate}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword" className={styles.label}>Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                
                {formData.newPassword !== formData.confirmPassword && formData.confirmPassword && (
                  <div className={styles.errorText}>Passwords do not match</div>
                )}
                
                <button 
                  type="submit" 
                  className={styles.button}
                  disabled={isSubmitting || (formData.newPassword !== formData.confirmPassword && !!formData.confirmPassword)}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 