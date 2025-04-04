'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  author: string;
  createdAt: string;
  lessonsCount: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories for filtering
  const categories = ['All', 'Web Development', 'Programming', 'Computer Science', 'Design', 'Data Science', 'Mobile Development'];

  useEffect(() => {
    // Fetch courses from API
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        // Format API response data to match Course interface
        const formattedCourses = data.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          category: course.category,
          author: course.author,
          createdAt: course.createdAt,
          lessonsCount: course.lessons.length
        }));
        
        setCourses(formattedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on category and search term
  const filteredCourses = courses.filter(course => {
    const matchesCategory = filter === 'all' || course.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className={styles.coursesPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Explore Courses</h1>
            <p className={styles.subtitle}>Discover new skills, expand your knowledge, and advance your career with our online courses.</p>
          </div>

          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.categoryFilters}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${styles.categoryButton} ${filter === (category.toLowerCase() === 'all' ? 'all' : category.toLowerCase()) ? styles.activeCategory : ''}`}
                  onClick={() => setFilter(category.toLowerCase() === 'all' ? 'all' : category.toLowerCase())}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className={styles.courseGrid}>
              {filteredCourses.map((course) => (
                <Link href={`/course/${course.id}`} key={course.id} className={styles.courseCard}>
                  <div className={styles.courseImage}>
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={400}
                      height={225}
                      className={styles.image}
                    />
                    <div className={styles.category}>{course.category}</div>
                  </div>
                  <div className={styles.courseContent}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDescription}>{course.description}</p>
                    <div className={styles.courseFooter}>
                      <div className={styles.courseMeta}>
                        <span className={styles.author}>By {course.author}</span>
                        <span className={styles.lessons}>{course.lessonsCount} lessons</span>
                      </div>
                      <span className={styles.courseDate}>
                        {new Date(course.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.noCourses}>
              <div className={styles.noCoursesIcon}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 className={styles.noCoursesTitle}>No Courses Found</h2>
              <p className={styles.noCoursesText}>
                We couldn't find any courses matching your criteria. Please try a different search or category.
              </p>
              <button 
                className={styles.resetButton}
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 