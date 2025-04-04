'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

interface Lesson {
  id: number;
  title: string;
  content?: string;
  completed?: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  progress: number;
  lessons: Lesson[];
  completedLessons: number;
  category: string;
  author: string;
  authorId: number;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isEnrolled?: boolean;
  isAuthor?: boolean;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!params.id) {
        setError("Course ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Course not found. The course with ID ${params.id} does not exist.`);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch course: ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id]);

  const handleLessonClick = (index: number) => {
    setCurrentLessonIndex(index);
  };

  const markLessonComplete = async (index: number) => {
    if (!course) return;
    
    try {
      // Call API to mark lesson as complete
      const response = await fetch(`/api/courses/${course.id}/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId: course.lessons[index].id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark lesson as complete');
      }
      
      // Update local state
      const updatedLessons = [...course.lessons];
      updatedLessons[index] = {
        ...updatedLessons[index],
        completed: true
      };
      
      setCourse({
        ...course,
        lessons: updatedLessons,
        completedLessons: course.completedLessons + 1,
        progress: Math.round(((course.completedLessons + 1) / course.lessons.length) * 100)
      });
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      // You could add an error notification here
    }
  };

  // Get course share URL
  const getCourseShareUrl = () => {
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/course/${params.id}`
      : '';
  };

  // Download QR code image
  const downloadQRCode = () => {
    const svg = document.getElementById("course-qr-code");
    if (!svg) return;
    
    // Create canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size to match QR code
    canvas.width = 256;
    canvas.height = 256;
    
    // Create image element
    const img = document.createElement("img");
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Draw image on canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to PNG and download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${course?.title || 'course'}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Toggle QR code display
  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  if (isLoading) {
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
          <h2 className={styles.errorTitle}>Course Not Found</h2>
          <p className={styles.errorMessage}>
            {error || 'Unable to load the course. Please try again later.'}
          </p>
          <Link href="/courses">
            <button className={styles.button}>Back to Courses</button>
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
                <span className={styles.metaItem}>By: {course.author}</span>
                <span className={styles.metaItem}>
                  Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.shareSection}>
                <button 
                  className={styles.shareButton}
                  onClick={toggleQRCode}
                >
                  {showQRCode ? 'Hide QR Code' : 'Share via QR Code'}
                </button>
                
                {showQRCode && (
                  <div className={styles.qrCodeContainer}>
                    <QRCode
                      id="course-qr-code"
                      value={getCourseShareUrl()}
                      size={200}
                      level="H"
                    />
                    <p className={styles.qrCodeCaption}>
                      Scan to access this course
                    </p>
                    <button 
                      className={styles.downloadQRButton}
                      onClick={downloadQRCode}
                    >
                      Download QR Code
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.courseImage}>
              <Image 
                src={course.imageUrl} 
                alt={course.title} 
                width={400} 
                height={225}
                className={styles.image}
              />
            </div>
          </div>
          
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <h2 className={styles.progressTitle}>Course Progress</h2>
              <span className={styles.progressPercentage}>{course.progress}%</span>
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
                    className={`${styles.lessonItem} ${index === currentLessonIndex ? styles.active : ''} ${lesson.completed ? styles.completed : ''}`}
                    onClick={() => handleLessonClick(index)}
                  >
                    <div className={styles.lessonNumber}>{index + 1}</div>
                    <div className={styles.lessonInfo}>
                      <span className={styles.lessonTitle}>{lesson.title}</span>
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
                  {currentLesson.title}
                </h2>
              </div>
              <div className={styles.lessonBody}>
                {currentLesson.content ? (
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                ) : (
                  <div className={styles.placeholderContent}>
                    <h3>Lesson Content</h3>
                    <p>
                      This is a sample lesson content. In a complete implementation, this would contain the actual lesson material, which could include text, images, videos, and interactive elements.
                    </p>
                    
                    <div className={styles.sampleContent}>
                      <h4>Key Points:</h4>
                      <ul>
                        <li>First important concept of this lesson</li>
                        <li>Second important concept with relevant examples</li>
                        <li>Practical application of the concepts covered</li>
                        <li>Summary of what was learned</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.lessonNavigation}>
                <button 
                  className={styles.navigationButton}
                  disabled={currentLessonIndex === 0}
                  onClick={() => setCurrentLessonIndex(prevIndex => Math.max(0, prevIndex - 1))}
                >
                  Previous Lesson
                </button>
                
                {!currentLesson.completed && course.isEnrolled ? (
                  <button 
                    className={`${styles.navigationButton} ${styles.completeButton}`}
                    onClick={() => markLessonComplete(currentLessonIndex)}
                  >
                    Mark as Complete
                  </button>
                ) : currentLesson.completed ? (
                  <span className={styles.lessonCompletedMessage}>
                    Lesson completed!
                  </span>
                ) : null}
                
                <button 
                  className={styles.navigationButton}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                  onClick={() => setCurrentLessonIndex(prevIndex => Math.min(course.lessons.length - 1, prevIndex + 1))}
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