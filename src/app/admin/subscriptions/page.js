'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';
import api from '@/utils/api';
import { getCurrentUser } from '@/utils/auth';
import { useToast } from '@/components/ui/toast';

export default function SubscriptionsAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    search: '',
    showArchived: false,
  });

  // Load subscriptions on page load or when filters/pagination change
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
       setLoading(true);
       setIsAuthorized(false);
       setError(null);
       
       const currentUser = getCurrentUser();
       if (currentUser && currentUser.role === 'ADMIN') {
          console.log("Admin Subscriptions: User is ADMIN (from localStorage)");
          setIsAuthorized(true);
          await fetchSubscriptions();
       } else {
          try {
             console.log("Admin Subscriptions: Checking auth via /api/auth/me");
             const response = await api.get('/auth/me');
             const user = response.data.user;
             if (user && user.role === 'ADMIN') {
                console.log("Admin Subscriptions: User is ADMIN (from API)");
                setIsAuthorized(true);
                await fetchSubscriptions();
             } else {
                 console.log("Admin Subscriptions: User is not ADMIN or not logged in.");
                 toast({ title: "Access Denied", description: "You do not have permission to view this page.", type: "error" });
                 router.push('/dashboard');
             }
          } catch (authError) {
             console.error("Admin Subscriptions: Auth check failed", authError);
             toast({ title: "Authentication Error", description: "Please log in as an administrator.", type: "error" });
             router.push('/login?redirect=/admin/subscriptions');
          }
       }
       setLoading(false);
    };

    checkAuthAndFetchData();
  }, []);

  // Separate useEffect for fetching when filters/pagination change, *only if authorized*
  useEffect(() => {
      if (isAuthorized) {
          fetchSubscriptions();
      }
  }, [isAuthorized, pagination.currentPage, pagination.pageSize, filters]);

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        showArchived: filters.showArchived,
      });
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      
      if (filters.plan) {
        queryParams.append('plan', filters.plan);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      // Make API request using api instance
      const response = await api.get(`/admin/subscriptions?${queryParams.toString()}`);
      
      const data = response.data;
      
      // Update state with response data
      setSubscriptions(data.subscriptions);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
         setError("Unauthorized. You might need to log in as an admin.");
      } else {
         setError(err.response?.data?.error || err.message || 'Failed to fetch subscriptions');
      }
      setSubscriptions([]);
      setPagination({ currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubscriptions();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  // Archive a subscription
  const handleArchiveSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to archive this subscription?')) {
      return;
    }
    
    try {
      setError(null);
      
      // Use api instance for DELETE request
      const response = await api.delete(`/admin/subscriptions/${id}`);
      
      console.log("Archive response:", response);
      
      // Refresh subscriptions list
      fetchSubscriptions();
      
    } catch (err) {
      console.error('Error archiving subscription:', err);
      setError(err.response?.data?.error || err.message || 'Failed to archive subscription');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return styles.statusActive;
      case 'PENDING':
        return styles.statusPending;
      case 'CANCELLED':
        return styles.statusCancelled;
      case 'EXPIRED':
        return styles.statusExpired;
      default:
        return '';
    }
  };

  if (loading && !isAuthorized) {
     return (
       <MainLayout>
         <div className={styles.loadingContainer}>
           <div className={styles.spinner}></div>
           <p>Verifying access...</p>
         </div>
       </MainLayout>
     );
  }
  
  if (!isAuthorized) {
      return (
          <MainLayout>
             <div className="container text-center py-10">
                <h2 className="text-xl text-red-600">Access Denied</h2>
                <p className="text-gray-600">You do not have permission to view this page.</p>
                <Link href="/dashboard"><button className="mt-4 btn btn-primary">Go to Dashboard</button></Link>
             </div>
          </MainLayout>
      );
  }

  return (
    <MainLayout>
      <div className={styles.adminPage}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Subscription Management</h1>
            <Link href="/admin/subscriptions/new">
              <button className={styles.createButton}>
                Create New Subscription
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
          
          <div className={styles.filtersSection}>
            <form onSubmit={handleSearch} className={styles.filters}>
              <div className={styles.filterGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={styles.select}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="plan">Plan</label>
                <select
                  id="plan"
                  name="plan"
                  value={filters.plan}
                  onChange={handleFilterChange}
                  className={styles.select}
                >
                  <option value="">All Plans</option>
                  <option value="BASIC">Basic</option>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Search by user name or email"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="showArchived"
                    checked={filters.showArchived}
                    onChange={handleFilterChange}
                  />
                  Show Archived
                </label>
              </div>
              
              <button type="submit" className={styles.filterButton}>
                Apply Filters
              </button>
            </form>
          </div>
          
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No subscriptions found</h3>
                <p>Try adjusting your filters or create a new subscription.</p>
              </div>
            ) : (
              <table className={styles.subscriptionsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Billing Cycle</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className={subscription.isArchived ? styles.archivedRow : ''}>
                      <td>{subscription.id}</td>
                      <td>
                        <div className={styles.userCell}>
                          {subscription.user.avatar && (
                            <img 
                              src={subscription.user.avatar}
                              alt={subscription.user.name}
                              className={styles.userAvatar}
                            />
                          )}
                          <div>
                            <div className={styles.userName}>{subscription.user.name}</div>
                            <div className={styles.userEmail}>{subscription.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{subscription.plan}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td>${subscription.price.toFixed(2)}</td>
                      <td>{subscription.billingCycle}</td>
                      <td>{formatDate(subscription.startDate)}</td>
                      <td>{formatDate(subscription.endDate)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Link href={`/admin/subscriptions/${subscription.id}`}>
                            <button className={styles.viewButton}>
                              View
                            </button>
                          </Link>
                          <Link href={`/admin/subscriptions/${subscription.id}/edit`}>
                            <button className={styles.editButton}>
                              Edit
                            </button>
                          </Link>
                          {!subscription.isArchived && (
                            <button 
                              className={styles.archiveButton}
                              onClick={() => handleArchiveSubscription(subscription.id)}
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {!loading && subscriptions.length > 0 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className={styles.paginationButton}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              
              <div className={styles.pageInfo}>
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalCount} total items)
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={styles.paginationButton}
              >
                Last
              </button>
              
              <div className={styles.pageSizeSelector}>
                <label htmlFor="pageSize">Items per page:</label>
                <select
                  id="pageSize"
                  value={pagination.pageSize}
                  onChange={(e) => {
                    setPagination(prev => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      currentPage: 1
                    }));
                  }}
                  className={styles.pageSizeSelect}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 