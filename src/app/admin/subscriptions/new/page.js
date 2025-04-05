'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    plan: '',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    price: '',
    billingCycle: '',
    features: '{}'
  });

  // Load users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users for user selection
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }
      
      const data = await response.json();
      
      // Redirect to subscription details page after successful creation
      router.push(`/admin/subscriptions/${data.id}`);
      
    } catch (err) {
      setError(err.message);
      console.error('Error creating subscription:', err);
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.newPage}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Create New Subscription</h1>
            <Link href="/admin/subscriptions">
              <button className={styles.backButton}>
                Back to List
              </button>
            </Link>
          </div>
          
          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
          )}
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>User Information</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="userId">Select User</label>
                  <select
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    required
                    className={styles.select}
                    disabled={loading}
                  >
                    <option value="">Select a User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {users.length === 0 && !loading && (
                    <small className={styles.hint}>No users found. Please add users first.</small>
                  )}
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Subscription Details</h2>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="plan">Subscription Plan</label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      required
                      className={styles.select}
                      disabled={loading}
                    >
                      <option value="">Select Plan</option>
                      <option value="BASIC">Basic</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className={styles.select}
                      disabled={loading}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={styles.input}
                      disabled={loading}
                    />
                    <small className={styles.hint}>Leave empty for ongoing subscriptions</small>
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className={styles.input}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="billingCycle">Billing Cycle</label>
                    <select
                      id="billingCycle"
                      name="billingCycle"
                      value={formData.billingCycle}
                      onChange={handleInputChange}
                      required
                      className={styles.select}
                      disabled={loading}
                    >
                      <option value="">Select Billing Cycle</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="features">Features (JSON)</label>
                  <textarea
                    id="features"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    rows="5"
                    placeholder='{"feature1": true, "feature2": false, "customLimit": 100}'
                    disabled={loading}
                  />
                  <small className={styles.hint}>Features in JSON format</small>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <Link href="/admin/subscriptions">
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </Link>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 