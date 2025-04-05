'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserAuthProvider';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import styles from './page.module.css';

interface Course {
  id: string;
  title: string;
  description: string;
  enrollments: number;
  status: 'published' | 'draft';
  lastUpdated: string;
}

export default function EducatorPortal() {
  const { user, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    // Redirect if user is not authenticated or not an educator
    if (!isLoading && (!isAuthenticated || user?.role !== 'EDUCATOR')) {
      router.push('/');
      return;
    }

    // Fetch educator courses
    const fetchCourses = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use sample data
        const sampleCourses: Course[] = [
          {
            id: '1',
            title: 'Introduction to Web Development',
            description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
            enrollments: 125,
            status: 'published',
            lastUpdated: '2023-04-15'
          },
          {
            id: '2',
            title: 'Python Programming for Beginners',
            description: 'A comprehensive introduction to Python for absolute beginners.',
            enrollments: 89,
            status: 'published',
            lastUpdated: '2023-03-22'
          },
          {
            id: '3',
            title: 'Advanced React Patterns',
            description: 'Master advanced React patterns and techniques for building complex applications.',
            enrollments: 0,
            status: 'draft',
            lastUpdated: '2023-04-02'
          }
        ];
        
        setCourses(sampleCourses);
        setIsLoadingCourses(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setIsLoadingCourses(false);
      }
    };

    if (isAuthenticated && user?.role === 'EDUCATOR') {
      fetchCourses();
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || isLoadingCourses) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading educator portal...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.educatorPortal}>
        <div className="container">
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Educator Portal</h1>
              <p className={styles.subtitle}>Manage your courses and track student progress</p>
            </div>
            <Link href="/create" className="btn btn-primary">
              Create New Course
            </Link>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>Total Courses</h3>
              <p className={styles.statValue}>{courses.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>Total Enrollments</h3>
              <p className={styles.statValue}>
                {courses.reduce((sum, course) => sum + course.enrollments, 0)}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>Published Courses</h3>
              <p className={styles.statValue}>
                {courses.filter(course => course.status === 'published').length}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statTitle}>Draft Courses</h3>
              <p className={styles.statValue}>
                {courses.filter(course => course.status === 'draft').length}
              </p>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Courses</h2>
          </div>

          {courses.length > 0 ? (
            <div className={styles.courseTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Title</div>
                <div className={styles.tableCell}>Status</div>
                <div className={styles.tableCell}>Enrollments</div>
                <div className={styles.tableCell}>Last Updated</div>
                <div className={styles.tableCell}>Actions</div>
              </div>
              
              {courses.map(course => (
                <div key={course.id} className={styles.tableRow}>
                  <div className={styles.tableCell}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDescription}>{course.description}</p>
                  </div>
                  <div className={styles.tableCell} data-label="Status">
                    <span className={`${styles.statusBadge} ${styles[course.status]}`}>
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className={styles.tableCell} data-label="Enrollments">{course.enrollments}</div>
                  <div className={styles.tableCell} data-label="Last Updated">{course.lastUpdated}</div>
                  <div className={styles.tableCell} data-label="Actions">
                    <div className={styles.actionButtons}>
                      <Link href={`/course/${course.id}`} className={styles.actionButton}>
                        View
                      </Link>
                      <Link href={`/course/${course.id}/edit`} className={styles.actionButton}>
                        Edit
                      </Link>
                      <Link href={`/course/${course.id}/analytics`} className={styles.actionButton}>
                        Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>No Courses Created Yet</h2>
              <p className={styles.emptyDescription}>Start creating courses to share your knowledge with students!</p>
              <Link href="/create" className="btn btn-primary">
                Create First Course
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 