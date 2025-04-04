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

// Sample course data
const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build responsive websites from scratch.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    category: 'Web Development',
    author: 'Jane Smith',
    createdAt: '2023-05-15',
    lessonsCount: 12
  },
  {
    id: '2',
    title: 'Python Programming for Beginners',
    description: 'A comprehensive introduction to Python programming language with practical exercises and projects.',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    category: 'Programming',
    author: 'John Doe',
    createdAt: '2023-04-10',
    lessonsCount: 10
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    description: 'Understand and implement common data structures and algorithms to solve complex programming challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1649180556628-9ba704115795',
    category: 'Computer Science',
    author: 'Alex Johnson',
    createdAt: '2023-06-20',
    lessonsCount: 15
  },
  {
    id: '4',
    title: 'UI/UX Design Principles',
    description: 'Master the fundamentals of user interface and user experience design to create intuitive and engaging applications.',
    imageUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d',
    category: 'Design',
    author: 'Emma Wilson',
    createdAt: '2023-03-05',
    lessonsCount: 8
  },
  {
    id: '5',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts, algorithms, and practical applications using Python.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    category: 'Data Science',
    author: 'Michael Brown',
    createdAt: '2023-07-12',
    lessonsCount: 14
  },
  {
    id: '6',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native framework and JavaScript.',
    imageUrl: 'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521',
    category: 'Mobile Development',
    author: 'Sarah Parker',
    createdAt: '2023-02-28',
    lessonsCount: 11
  }
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories for filtering
  const categories = ['All', 'Web Development', 'Programming', 'Computer Science', 'Design', 'Data Science', 'Mobile Development'];

  useEffect(() => {
    // Simulate API call to fetch courses
    const fetchCourses = async () => {
      try {
        // In a real application, this would be an API call
        setTimeout(() => {
          setCourses(sampleCourses);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching courses:', error);
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