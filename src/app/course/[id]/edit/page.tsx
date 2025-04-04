'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

interface Lesson {
  id: string;
  title: string;
  completed?: boolean;
  content?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lessons: Lesson[];
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'lessons' | 'settings' | 'share'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCourse(data);
        
        // Initialize form state
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setImageUrl(data.imageUrl);
        setIsPublic(data.isPublic);
        setLessons(data.lessons);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCourseData();
    }
  }, [params.id]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    const updatedCourse = {
      ...course,
      title,
      description,
      category,
      imageUrl,
      isPublic,
      lessons,
      updatedAt: new Date().toISOString()
    };

    try {
      // In a real app, this would be a PUT request to update the course
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // For demo purposes, just update the local state
      setCourse(updatedCourse as Course);
      setSaveMessage('Course updated successfully!');
      
      // This message will disappear after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error updating course:', err);
      setSaveMessage(`Error: ${err instanceof Error ? err.message : 'Failed to update course'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 获取课程分享URL
  const getCourseShareUrl = () => {
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/course/${params.id}`
      : '';
  };

  // 下载二维码图片
  const downloadQRCode = () => {
    const svg = document.getElementById("course-qr-code");
    if (!svg) return;
    
    // 创建Canvas以将SVG转为PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // 设置Canvas大小与QR码相同
    canvas.width = 256;
    canvas.height = 256;
    
    // 创建图片元素
    const img = document.createElement("img");
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // 在Canvas上绘制图像
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 转换Canvas为PNG并下载
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${title || 'course'}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Add a new lesson
  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Lesson',
      content: 'Add your lesson content here...',
      completed: false
    };
    
    setLessons([...lessons, newLesson]);
  };

  // Update a lesson
  const updateLesson = (index: number, updatedLesson: Lesson) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = updatedLesson;
    setLessons(updatedLessons);
  };

  // Delete a lesson
  const deleteLesson = (index: number) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      const updatedLessons = [...lessons];
      updatedLessons.splice(index, 1);
      setLessons(updatedLessons);
    }
  };

  // Move lesson up/down
  const moveLesson = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === lessons.length - 1)
    ) {
      return;
    }

    const updatedLessons = [...lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedLessons[index], updatedLessons[targetIndex]] = 
    [updatedLessons[targetIndex], updatedLessons[index]];
    
    setLessons(updatedLessons);
  };

  // Handle tab changes
  const handleTabChange = (tab: 'basic' | 'lessons' | 'settings' | 'share') => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading course information...</p>
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
            {error || 'Unable to load the course information. Please try again later.'}
          </p>
          <Link href="/dashboard">
            <button className={styles.button}>Back to Dashboard</button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.courseEditPage}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Edit Course</h1>
          <div className={styles.actions}>
            <Link href={`/course/${params.id}`}>
              <button className={styles.secondaryButton}>View Course</button>
            </Link>
            <button 
              className={styles.primaryButton}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className={`${styles.saveMessage} ${saveMessage.includes('Error') ? styles.errorMessage : styles.successMessage}`}>
            {saveMessage}
          </div>
        )}

        <div className={styles.tabNav}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'basic' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('basic')}
          >
            Basic Information
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'lessons' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('lessons')}
          >
            Lessons
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'share' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('share')}
          >
            Share & QR Code
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            Settings
          </button>
        </div>

        <div className={styles.formContainer}>
          {activeTab === 'basic' && (
            <div className={styles.basicInfoForm}>
              <div className={styles.formField}>
                <label htmlFor="title">Course Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter course description"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal-development">Personal Development</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="imageUrl">Cover Image URL</label>
                <input
                  id="imageUrl"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className={styles.imagePreview}>
                    <Image 
                      src={imageUrl} 
                      alt="Course preview" 
                      width={200} 
                      height={120} 
                      className={styles.previewImage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className={styles.lessonsTab}>
              <div className={styles.lessonControls}>
                <h3>Course Lessons ({lessons.length})</h3>
                <button 
                  className={styles.addLessonButton}
                  onClick={addLesson}
                >
                  Add New Lesson
                </button>
              </div>
              
              {lessons.length === 0 ? (
                <div className={styles.noLessons}>
                  <p>This course doesn't have any lessons yet. Add your first lesson to get started.</p>
                </div>
              ) : (
                <div className={styles.lessonsList}>
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className={styles.lessonItem}>
                      <div className={styles.lessonNumber}>{index + 1}</div>
                      <div className={styles.lessonEditForm}>
                        <div className={styles.lessonHeader}>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, { ...lesson, title: e.target.value })}
                            placeholder="Lesson title"
                            className={styles.lessonTitleInput}
                          />
                          <div className={styles.lessonActions}>
                            <button 
                              className={styles.actionButton}
                              onClick={() => moveLesson(index, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button 
                              className={styles.actionButton}
                              onClick={() => moveLesson(index, 'down')}
                              disabled={index === lessons.length - 1}
                            >
                              ↓
                            </button>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => deleteLesson(index)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className={styles.lessonContent}>
                          <textarea
                            value={lesson.content || ''}
                            onChange={(e) => updateLesson(index, { ...lesson, content: e.target.value })}
                            rows={5}
                            placeholder="Lesson content goes here..."
                            className={styles.lessonContentInput}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'share' && (
            <div className={styles.shareTab}>
              <h3 className={styles.shareTitle}>Share Your Course</h3>
              <p className={styles.shareDescription}>
                Use this QR code to easily share your course with others. They can scan it with their phone camera to directly access the course.
              </p>
              
              <div className={styles.qrCodeContainer}>
                <QRCode
                  id="course-qr-code"
                  value={getCourseShareUrl()}
                  size={250}
                  level="H"
                />
                
                <div className={styles.qrCodeInfo}>
                  <p className={styles.qrCodeUrl}>
                    <strong>Course URL:</strong> {getCourseShareUrl()}
                  </p>
                  
                  <div className={styles.shareButtons}>
                    <button 
                      className={styles.downloadButton}
                      onClick={downloadQRCode}
                    >
                      Download QR Code
                    </button>
                    
                    <button 
                      className={styles.copyLinkButton}
                      onClick={() => {
                        navigator.clipboard.writeText(getCourseShareUrl());
                        alert('Course link copied to clipboard!');
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.shareInstructions}>
                <h4>How to use this QR code:</h4>
                <ol>
                  <li>Download the QR code image using the button above</li>
                  <li>Include it in your presentations, handouts, or print materials</li>
                  <li>Users can scan the code with their smartphone camera to directly access your course</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={styles.settingsTab}>
              <div className={styles.formField}>
                <label htmlFor="isPublic" className={styles.checkboxLabel}>
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Make this course public</span>
                </label>
                <p className={styles.fieldHelp}>
                  Public courses can be discovered and accessed by all users.
                </p>
              </div>

              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <div className={styles.dangerAction}>
                  <div>
                    <h4>Delete Course</h4>
                    <p>Once deleted, this course and all its contents cannot be recovered.</p>
                  </div>
                  <button 
                    className={styles.dangerButton}
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                        // In a real app, this would delete the course
                        router.push('/dashboard');
                      }
                    }}
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 