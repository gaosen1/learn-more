import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import styles from "./page.module.css";

// Sample course data
const courses = [
  {
    id: '1',
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
    progress: 75,
    lessons: 12,
    completedLessons: 9
  },
  {
    id: '2',
    title: 'Python Programming for Beginners',
    description: 'Start learning Python programming from scratch',
    progress: 40,
    lessons: 10,
    completedLessons: 4
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    description: 'Understand and implement common data structures and algorithms',
    progress: 10,
    lessons: 15,
    completedLessons: 1
  }
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>My Courses</h1>
            <Link href="/create" className="btn btn-primary">
              Create New Course
            </Link>
          </div>
          
          {courses.length > 0 ? (
            <div className={styles.courses}>
              {courses.map(course => (
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
                    <span>Lessons: {course.completedLessons}/{course.lessons}</span>
                  </div>
                  <div className={styles.courseActions}>
                    <Link href={`/course/${course.id}`} className="btn btn-primary">
                      Continue Learning
                    </Link>
                    <Link href={`/course/${course.id}/edit`} className="btn btn-outline">
                      Edit Course
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
              <h2 className={styles.emptyTitle}>No Courses Yet</h2>
              <p className={styles.emptyDescription}>Create your first course and start sharing knowledge!</p>
              <Link href="/create" className="btn btn-primary">
                Create Course
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 