'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  progress: number;
  lessons: Lesson[];
  completedLessons: number;
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        if (!response.ok) {
          throw new Error('Course not found');
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError('Failed to load course');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const handleLessonClick = (index: number) => {
    setCurrentLessonIndex(index);
  };

  const handleMarkComplete = () => {
    if (!course) return;
    
    const updatedLessons = [...course.lessons];
    updatedLessons[currentLessonIndex].completed = true;
    
    const updatedCompletedLessons = updatedLessons.filter(lesson => lesson.completed).length;
    const updatedProgress = Math.round((updatedCompletedLessons / updatedLessons.length) * 100);
    
    setCourse({
      ...course,
      lessons: updatedLessons,
      completedLessons: updatedCompletedLessons,
      progress: updatedProgress
    });

    // In a real app, you would save this to the backend
    console.log('Marking lesson as complete:', updatedLessons[currentLessonIndex].id);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading course...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Error</h1>
          <p className={styles.errorMessage}>{error || 'Course not found'}</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </MainLayout>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];

  return (
    <MainLayout>
      <div className={styles.coursePage}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.courseInfo}>
              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.courseDescription}>{course.description}</p>
              <div className={styles.metadata}>
                <span className={styles.metaItem}>Category: {course.category}</span>
                <span className={styles.metaItem}>Instructor: {course.author}</span>
                <span className={styles.metaItem}>Last Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={styles.courseImage}>
              <Image
                src={course.imageUrl || '/course-images/default.jpg'}
                alt={course.title}
                width={300}
                height={200}
                className={styles.image}
              />
            </div>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <h2 className={styles.progressTitle}>Course Progress</h2>
              <span className={styles.progressPercentage}>{course.progress}% Complete</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <p className={styles.progressText}>
              {course.completedLessons} of {course.lessons.length} lessons completed
            </p>
          </div>

          <div className={styles.courseContent}>
            <div className={styles.lessonList}>
              <h2 className={styles.lessonListTitle}>Course Lessons</h2>
              <div className={styles.lessons}>
                {course.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className={`${styles.lessonItem} ${currentLessonIndex === index ? styles.active : ''} ${lesson.completed ? styles.completed : ''}`}
                    onClick={() => handleLessonClick(index)}
                  >
                    <div className={styles.lessonNumber}>{index + 1}</div>
                    <div className={styles.lessonInfo}>
                      <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                      {lesson.completed && (
                        <span className={styles.completedBadge}>Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.lessonContent}>
              <div className={styles.lessonHeader}>
                <h2 className={styles.currentLessonTitle}>
                  Lesson {currentLessonIndex + 1}: {currentLesson.title}
                </h2>
                {!currentLesson.completed && (
                  <button className="btn btn-primary" onClick={handleMarkComplete}>
                    Mark as Complete
                  </button>
                )}
              </div>

              <div className={styles.lessonBody}>
                {/* Here we would display actual lesson content */}
                <div className={styles.placeholderContent}>
                  <h3>Lesson Content</h3>
                  <p>
                    This is a placeholder for the actual lesson content. In a real application, 
                    this would contain text, videos, interactive elements, quizzes, and more.
                  </p>
                  <p>
                    The content for this lesson would be specific to the topic: <strong>{currentLesson.title}</strong>.
                  </p>
                  <div className={styles.sampleContent}>
                    <h4>Example Section</h4>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce congue, 
                      nunc eu commodo tempor, nisi nulla scelerisque nulla, eget gravida est 
                      lectus non nibh. Suspendisse potenti. Donec sit amet semper neque, eu 
                      finibus nisi.
                    </p>
                    <ul>
                      <li>Important point one about {currentLesson.title}</li>
                      <li>Key concept two related to this lesson</li>
                      <li>Practice exercise to reinforce learning</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.lessonNavigation}>
                <button 
                  className="btn btn-outline" 
                  disabled={currentLessonIndex === 0}
                  onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
                >
                  Previous Lesson
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={currentLessonIndex === course.lessons.length - 1}
                  onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                >
                  Next Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 