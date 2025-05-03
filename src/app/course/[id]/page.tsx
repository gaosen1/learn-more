'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';
import api from '@/utils/api';
import { getCurrentUser } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

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
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    
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
    if (!course || !course.lessons[index] || !currentUser) return;
    
    const lessonId = course.lessons[index].id;
    const courseId = course.id;
    
    if (course.lessons[index].completed) {
        console.log(`Lesson ${lessonId} already marked as complete locally.`);
        return; 
    }

    console.log(`Marking lesson ${lessonId} for course ${courseId} as complete...`);

    const originalLessons = [...course.lessons];
    const updatedLessonsOptimistic = [...originalLessons];
    updatedLessonsOptimistic[index] = { ...updatedLessonsOptimistic[index], completed: true };
    setCourse(prevCourse => prevCourse ? {
        ...prevCourse,
        lessons: updatedLessonsOptimistic,
    } : null);

    try {
      const response = await api.post(`/courses/${courseId}/complete-lesson`, { lessonId });
      
      if (response.status === 200) {
        const data = response.data;
        console.log("Lesson mark complete API success:", data);

        setCourse(prevCourse => {
            if (!prevCourse) return null;
            const lessonsWithCompletion = [...prevCourse.lessons]; 
            if (lessonsWithCompletion[index]) {
                lessonsWithCompletion[index] = { ...lessonsWithCompletion[index], completed: true };
            }
            return {
                ...prevCourse,
                lessons: lessonsWithCompletion,
                progress: data.progress,
                completedLessons: data.completedLessons
            };
        });
        
        toast({ title: "Success", description: data.message || "Lesson marked as complete!", type: "success" });

      } else {
         throw new Error(response.data?.error || `API responded with status ${response.status}`);
      }

    } catch (err: any) {
      console.error('Error marking lesson as complete via API:', err);
      toast({ 
          title: "Error", 
          description: err.response?.data?.error || err.message || "Failed to save progress. Please try again.", 
          type: "error" 
      });

      setCourse(prevCourse => prevCourse ? { ...prevCourse, lessons: originalLessons } : null);
    } finally {
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

  const handleEnroll = async () => {
    if (!course || !currentUser || isEnrolling) return;

    setIsEnrolling(true);
    try {
      console.log(`Attempting to enroll user ${currentUser.id} in course ${course.id}`);
      const response = await api.post(`/courses/${course.id}/enroll`);

      if (response.status === 200 && response.data?.message === 'Already enrolled') {
        toast({ title: "Already Enrolled", description: "You are already enrolled in this course.", type: "info" });
        setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
      } else if (response.status === 201) { 
        toast({ title: "Enrollment Successful!", description: "You can now start learning.", type: "success" });
        setCourse(prev => prev ? { ...prev, isEnrolled: true, progress: 0, completedLessons: 0 } : null);
      } else {
        console.warn("Enrollment API returned unexpected success response:", response);
        if (response.status >= 200 && response.status < 300) {
           setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
        } else {
          throw new Error(response.data?.error || `Enrollment failed with status ${response.status}`);
        }
      }

    } catch (err: any) {
      console.error("Error enrolling in course:", err);
      toast({ 
          title: "Enrollment Failed", 
          description: err.response?.data?.error || err.message || "Could not enroll in the course. Please try again.", 
          type: "error" 
      });
    } finally {
      setIsEnrolling(false);
    }
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

              <div className={styles.actionsSection}>
                {currentUser && !course.isEnrolled && !course.isAuthor && (
                  <Button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="mt-4"
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
                {currentUser && course.isEnrolled && !course.isAuthor && (
                   <span className="mt-4 inline-block text-green-600 font-semibold">✓ Enrolled</span>
                )}
                {currentUser && course.isAuthor && (
                  <Link href={`/course/${course.id}/edit`} className="mt-4 btn btn-outline">
                    Edit Course
                  </Link>
                )}
                <Button 
                  variant="outline"
                  className="mt-4 ml-4"
                  onClick={toggleQRCode}
                >
                  {showQRCode ? 'Hide QR Code' : 'Share Course'}
                </Button>
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
          
          {currentUser && course.isEnrolled && (
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
          )}
          
          {(course.isEnrolled || course.isPublic || course.isAuthor) && (
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
          )}
          {!course.isEnrolled && !course.isPublic && !course.isAuthor && currentUser && (
              <div className="text-center p-8 border rounded-md mt-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-2">Enroll to view lessons</h3>
                  <p className="text-gray-600 mb-4">Access the full course content by enrolling.</p>
                  <Button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
              </div>
          )}
          {!currentUser && !course.isPublic && (
              <div className="text-center p-8 border rounded-md mt-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-2">Login to enroll</h3>
                  <p className="text-gray-600 mb-4">Please log in or sign up to enroll in this course.</p>
                  <Link href={`/login?redirect=/course/${course.id}`} className="btn btn-primary">
                      Login to Enroll
                  </Link>
              </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 