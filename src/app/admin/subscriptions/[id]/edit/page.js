'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

export default function EditSubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    plan: '',
    status: '',
    startDate: '',
    endDate: '',
    price: '',
    billingCycle: '',
    features: '',
  });
  const [users, setUsers] = useState([]);

  // Load subscription data on page load
  useEffect(() => {
    fetchSubscription();
    fetchUsers();
  }, [params.id]);

  // Fetch subscription from API
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/subscriptions/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscription');
      }
      
      const data = await response.json();
      
      // Set subscription data
      setSubscription(data);
      
      // Format dates for form inputs
      const formattedStartDate = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '';
      const formattedEndDate = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '';
      
      // Set form data
      setFormData({
        plan: data.plan,
        status: data.status,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        price: data.price.toString(),
        billingCycle: data.billingCycle,
        features: data.features,
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for user selection
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      
    } catch (err) {
      console.error('Error fetching users:', err);
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
      setSaving(true);
      
      const response = await fetch(`/api/admin/subscriptions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }
      
      // Redirect to subscription details page after successful update
      router.push(`/admin/subscriptions/${params.id}`);
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating subscription:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading subscription data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error && !subscription) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/admin/subscriptions">
            <button className={styles.backButton}>
              Back to Subscriptions
            </button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.editPage}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Edit Subscription</h1>
            <div className={styles.actions}>
              <Link href={`/admin/subscriptions/${params.id}`}>
                <button className={styles.viewButton}>
                  View Subscription
                </button>
              </Link>
              <Link href="/admin/subscriptions">
                <button className={styles.backButton}>
                  Back to List
                </button>
              </Link>
            </div>
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
                    >
                      <option value="">Select Status</option>
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
                  />
                  <small className={styles.hint}>Features in JSON format</small>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <Link href="/admin/subscriptions">
                  <button type="button" className={styles.cancelButton}>
                    Cancel
                  </button>
                </Link>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 