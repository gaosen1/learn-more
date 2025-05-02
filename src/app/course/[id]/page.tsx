'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';
import api from '@/utils/api';

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
      
      const courseId = params.id;
      if (!courseId) {
        setError("Course ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching course data for ID: ${courseId}`);
        const response = await api.get(`/courses/${courseId}`);
        
        const data = response.data;
        console.log("Course data received:", data);
        
        if (!data || typeof data.id === 'undefined' || !Array.isArray(data.lessons)) {
           console.error("Invalid course data structure received:", data);
           throw new Error("Received invalid data format for the course.");
        }
        
        setCourse(data);
        setCurrentLessonIndex(0);

      } catch (err: any) {
        console.error('Error fetching course:', err);
        let errorMessage = 'Failed to load course. Please try again later.';
        if (err.response?.status === 404) {
            errorMessage = `Course not found. The course with ID ${courseId} might not exist or you may not have permission to view it.`;
        } else if (err.message) {
            errorMessage = err.message;
        }
        setError(errorMessage);
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
    if (!course || !course.lessons[index]) return;
    const lessonId = course.lessons[index].id;
    const courseId = course.id;

    console.log(`Marking lesson ${lessonId} for course ${courseId} as complete...`);
    try {
      console.warn("API call for marking lesson complete not implemented yet. Simulating success.");
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatedLessons = [...course.lessons];
      updatedLessons[index] = { ...updatedLessons[index], completed: true };
      
      const newCompletedCount = updatedLessons.filter(l => l.completed).length;
      const newProgress = course.lessons.length > 0 
        ? Math.round((newCompletedCount / course.lessons.length) * 100) 
        : 0;

      setCourse(prevCourse => prevCourse ? {
        ...prevCourse,
        lessons: updatedLessons,
        completedLessons: newCompletedCount,
        progress: newProgress
      } : null);

      console.log("Lesson marked complete locally.");

    } catch (err: any) {
      console.error('Error marking lesson as complete:', err);
      alert("Failed to mark lesson as complete. Please try again.");
    }
  };

  const getCourseShareUrl = () => {
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/course/${params.id}`
      : '';
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("course-qr-code");
    if (!svg) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = 256;
    canvas.height = 256;
    
    const img = document.createElement("img");
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
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

  const currentLesson = course.lessons && course.lessons.length > currentLessonIndex 
                       ? course.lessons[currentLessonIndex] 
                       : null;

  return (
    <MainLayout>
      <div className={styles.coursePage}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.courseInfo}>
              <h1 className={styles.courseTitle}>{course?.title || 'Loading...'}</h1>
              <p className={styles.courseDescription}>{course?.description || ''}</p>
              
              <div className={styles.metadata}>
                <span className={styles.metaItem}>Category: {course?.category || 'N/A'}</span>
                <span className={styles.metaItem}>By: {course?.author || 'N/A'}</span>
                {course?.updatedAt && (
                  <span className={styles.metaItem}>
                    Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                )}
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
              {course?.imageUrl && (
                <Image 
                  src={course.imageUrl} 
                  alt={course.title} 
                  width={400} 
                  height={225}
                  className={styles.image}
                  onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.onerror = null; 
                     target.src = '/images/placeholder.png';
                   }}
                />
              )}
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
              {currentLesson ? (
                <>
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
                </>
              ) : (
                <div className={styles.placeholderContent}>
                  Select a lesson to view its content.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 