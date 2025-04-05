'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserAuthProvider';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';
import api from '@/utils/api';

interface Feature {
  coursesLimit: number;
  downloadContent: boolean;
  supportLevel: string;
  certificatesEnabled: boolean;
  mentorSupport?: boolean;
  customBranding?: boolean;
  teamManagement?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: Feature;
  description: string;
  popular: boolean;
}

export default function PricingPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载订阅计划
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/subscriptions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        
        const data = await response.json();
        setPlans(data.subscriptionPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  // 处理订阅
  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      // 未登录用户重定向到登录页面
      router.push(`/login?redirect=/pricing&plan=${planId}`);
      return;
    }
    
    try {
      setError(null);
      setSubscribing(true);
      
      // 调用API创建订阅
      const response = await api.post('/subscriptions', {
        plan: planId,
        billingCycle: billingCycle
      });
      
      // 订阅成功后重定向到仪表盘
      router.push('/dashboard?subscription=success');
      
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.error || 'Failed to create subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return billingCycle === 'yearly' 
      ? `$${(price * 10).toFixed(2)}` 
      : `$${price.toFixed(2)}`;
  };

  // 获取计费周期文本
  const getBillingText = () => {
    return billingCycle === 'yearly' ? 'per year' : 'per month';
  };

  // 检查特性是否可用
  const hasFeature = (feature: any) => {
    if (typeof feature === 'boolean') return feature;
    if (typeof feature === 'number') return feature > 0 || feature === -1;
    return !!feature;
  };

  // 格式化特性文本
  const formatFeature = (key: string, value: any) => {
    if (key === 'coursesLimit') {
      return value === -1 ? 'Unlimited courses' : `${value} courses`;
    }
    if (key === 'supportLevel') {
      return `${value.charAt(0).toUpperCase() + value.slice(1)} support`;
    }
    if (key === 'downloadContent') {
      return 'Download course content';
    }
    if (key === 'certificatesEnabled') {
      return 'Course completion certificates';
    }
    if (key === 'mentorSupport') {
      return 'One-on-one mentor support';
    }
    if (key === 'customBranding') {
      return 'Custom branding';
    }
    if (key === 'teamManagement') {
      return 'Team management tools';
    }
    return key;
  };

  return (
    <MainLayout>
      <div className={styles.pricingPage}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Choose Your Plan</h1>
            <p className={styles.subtitle}>
              Unlock your learning potential with our subscription plans
            </p>
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
          
          <div className={styles.billingToggle}>
            <span className={billingCycle === 'monthly' ? styles.active : ''}>Monthly</span>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={billingCycle === 'yearly'} 
                onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={billingCycle === 'yearly' ? styles.active : ''}>
              Yearly <span className={styles.savingTag}>Save 15%</span>
            </span>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading subscription plans...</p>
            </div>
          ) : (
            <div className={styles.plansGrid}>
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`${styles.planCard} ${plan.popular ? styles.popularPlan : ''}`}
                >
                  {plan.popular && (
                    <div className={styles.popularBadge}>Most Popular</div>
                  )}
                  <div className={styles.planHeader}>
                    <h2 className={styles.planName}>{plan.name}</h2>
                    <p className={styles.planDescription}>{plan.description}</p>
                  </div>
                  
                  <div className={styles.planPrice}>
                    <span className={styles.price}>
                      {formatPrice(plan.price)}
                    </span>
                    <span className={styles.billingCycle}>
                      {getBillingText()}
                    </span>
                  </div>
                  
                  <div className={styles.planFeatures}>
                    <ul>
                      {Object.entries(plan.features).map(([key, value]) => (
                        hasFeature(value) && (
                          <li key={key} className={styles.feature}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={styles.checkIcon}
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            {formatFeature(key, value)}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    className={`${styles.subscribeButton} ${plan.popular ? styles.primaryButton : ''}`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing}
                  >
                    {subscribing && selectedPlan === plan.id ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className={styles.guaranteeSection}>
            <div className={styles.guaranteeContent}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.guaranteeIcon}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <h3>14-Day Money Back Guarantee</h3>
                <p>If you're not satisfied with your subscription, contact us within 14 days for a full refund.</p>
              </div>
            </div>
          </div>
          
          <div className={styles.faqSection}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3>Can I change my plan later?</h3>
                <p>Yes, you can upgrade or downgrade your subscription plan at any time from your account settings.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>How do I cancel my subscription?</h3>
                <p>You can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>What payment methods are accepted?</h3>
                <p>We accept all major credit cards including Visa, Mastercard, American Express, and Discover.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>Will I be charged automatically?</h3>
                <p>Yes, your subscription will renew automatically at the end of each billing period unless you cancel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 