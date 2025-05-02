'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import styles from "./page.module.css";
import api from '@/utils/api';
import { publishAuthChange, getCurrentUser } from '@/utils/auth';
import { useToast } from '@/components/ui/toast';
import { LoadingDots } from '@/components/ui/loading';

// Interface for enrolled courses returned by the API
interface EnrolledCourse {
  id: number; // API returns number
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  isPublic: boolean;
  author: string;
  createdAt: string;
  lessonsCount: number;
  progress: number; // From UserCourse record
  completedLessons: number; // From UserCourse record
  enrolledAt: string;
}

// Remove sample course data
// const courses = [...];

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Separate loading state for auth
  const [isCoursesLoading, setIsCoursesLoading] = useState(true); // Separate loading state for courses
  const [userName, setUserName] = useState<string | null>(null);
  const [myCourses, setMyCourses] = useState<EnrolledCourse[]>([]); // State for enrolled courses
  const [error, setError] = useState<string | null>(null); // General error state

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const authenticateAndLoadCourses = async () => {
      setIsAuthLoading(true);
      setIsCoursesLoading(true); // Start both loadings
      setError(null);
      let authenticatedUser = getCurrentUser();

      // 1. Authenticate User
      if (!authenticatedUser) {
        console.log('Dashboard: No user in localStorage, attempting fetch from /api/auth/me');
        try {
          const response = await api.get('/auth/me');
          const userData = response.data.user;
          if (isMounted && userData) {
            console.log('Dashboard: Auth fetch successful:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            publishAuthChange(userData);
            setUserName(userData.name);
            authenticatedUser = userData; // Use fetched user for next step
             setIsAuthLoading(false); // Auth part is done
          } else if (isMounted) {
            throw new Error('No user data returned from /api/auth/me');
          }
        } catch (authError: any) {
           if (isMounted) {
             console.error('Dashboard: Auth fetch failed:', authError);
             localStorage.removeItem('user');
             publishAuthChange(null);
             setError("Authentication failed. Please log in again.");
             setIsAuthLoading(false);
             setIsCoursesLoading(false); // Stop course loading as well
             router.push('/login?error=session_expired');
             return; // Stop execution if auth fails
           }
        }
      } else {
         if (isMounted) {
            console.log('Dashboard: User found in localStorage.');
            setUserName(authenticatedUser.name);
            setIsAuthLoading(false); // Auth part is done
         }
      }

      // 2. Fetch "My Courses" if authenticated
      if (authenticatedUser && isMounted) {
        console.log('Dashboard: Fetching my courses...');
        try {
          const response = await api.get('/courses?context=my-courses');
          const coursesData = response.data;

          if (isMounted) {
            if (Array.isArray(coursesData)) {
              console.log('Dashboard: My courses data received:', coursesData);
              setMyCourses(coursesData);
            } else {
              console.error('Dashboard: Invalid data format for my courses:', coursesData);
              setError("Failed to load your courses. Invalid data received.");
              setMyCourses([]); // Set empty to prevent render errors
            }
             setIsCoursesLoading(false); // Courses part is done
          }
        } catch (coursesError: any) {
           if (isMounted) {
             console.error('Dashboard: Failed to fetch my courses:', coursesError);
             setError("Could not load your courses. Please try again later.");
             setIsCoursesLoading(false); // Courses part is done (with error)
           }
        }
      } else if (isMounted) {
         // If somehow user is not authenticated after checks, stop loading
         setIsCoursesLoading(false);
      }
    };

    authenticateAndLoadCourses();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };

  }, [router, toast]); // Keep dependencies minimal

  // Combined loading state check
  const isLoading = isAuthLoading || isCoursesLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container flex justify-center items-center min-h-[calc(100vh-200px)]">
          <LoadingDots size="lg" />
        </div>
      </MainLayout>
    );
  }

   // Handle general errors after loading
   if (error) {
     return (
       <MainLayout>
         <div className="container text-center py-10">
           <h2 className="text-xl text-red-600">Error Loading Dashboard</h2>
           <p className="text-gray-600">{error}</p>
           <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
             Retry
           </button>
         </div>
       </MainLayout>
     );
   }


  // Render dashboard content
  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>{userName ? `${userName}'s Courses` : 'My Courses'}</h1>
             {/* TODO: Check user role before showing "Create New Course" */}
             {/* {isEducator && ( */}
               <Link href="/create" className="btn btn-primary">
                 Create New Course
               </Link>
             {/* )} */}
          </div>

           {/* Render "My Courses" list */}
          {myCourses.length > 0 ? (
            <div className={styles.courses}>
              {myCourses.map(course => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseHeader}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <div className={styles.progress}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>
                      {course.progress}% Complete
                    </span>
                  </div>
                  <p className={styles.courseDescription}>{course.description}</p>
                  <div className={styles.courseMeta}>
                    <span>Lessons: {course.completedLessons}/{course.lessonsCount}</span>
                  </div>
                  <div className={styles.courseActions}>
                    <Link href={`/course/${course.id}`} className="btn btn-primary">
                      Continue Learning
                    </Link>
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
              <h2 className={styles.emptyTitle}>You haven't enrolled in any courses yet.</h2>
              <p className={styles.emptyDescription}>Explore courses and start learning!</p>
              <Link href="/courses" className="btn btn-primary">
                Explore Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 