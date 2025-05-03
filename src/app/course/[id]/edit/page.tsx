'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';
import api from '@/utils/api';
import { useUser } from '@/components/UserAuthProvider';
import { useToast } from '@/components/ui/toast';

interface Lesson {
  id: number;
  title: string;
  completed?: boolean;
  content?: string;
  order?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  lessons: Lesson[];
  sections?: any[];
  category: string;
  author: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const courseId = parseInt(params.id as string, 10);

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'share' | 'settings'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const fetchCourseData = useCallback(async () => {
    if (isNaN(courseId)) {
      setError("Invalid Course ID.");
      setIsLoading(false);
      return;
    }
    if (isUserLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching course data for ID: ${courseId}`);
      const response = await api.get<Course>(`/courses/${courseId}`);
      const data = response.data;

      console.log("Course data received:", data);

      if (!currentUser) {
        setError('You must be logged in to edit courses.');
        toast({ title: "Authentication Required", description: "Please log in.", type: "error" });
        router.push(`/login?redirect=/course/${courseId}/edit`);
        setIsLoading(false);
        return;
      }
      if (data.authorId !== currentUser.id) {
        setError('You are not authorized to edit this course.');
        toast({ title: "Access Denied", description: "Only the course author can edit.", type: "error" });
        router.push('/dashboard');
        setIsLoading(false);
        return;
      }

      setCourse(data);

      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setImageUrl(data.imageUrl);
      setIsPublic(data.isPublic);

    } catch (err: any) {
      console.error('Error fetching course:', err);
      let errorMessage = 'Failed to load course data.';
      if (err.response?.status === 404) {
        errorMessage = `Course not found.`;
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view this course for editing.';
        router.push('/dashboard');
      }
      setError(errorMessage);
      toast({ title: "Error Loading Course", description: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, router, currentUser, isUserLoading, toast]);

  useEffect(() => {
    if (!isNaN(courseId) && !isUserLoading) {
      fetchCourseData();
    }
  }, [courseId, isUserLoading, fetchCourseData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || isSaving || isDeleting) return;

    setIsSaving(true);

    const updatedCourseData = {
      title,
      description,
      category,
      imageUrl,
      isPublic,
    };

    try {
      console.log(`Updating course ${courseId} with data:`, updatedCourseData);
      const response = await api.put(`/courses/${courseId}`, updatedCourseData);

      console.log("Course update response:", response.data);
      setCourse(prevCourse => prevCourse ? { ...prevCourse, ...response.data } : null);
      toast({ title: "Success", description: "Course updated successfully!", type: "success" });

    } catch (err: any) {
      console.error('Error updating course:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to update course';
      toast({ title: "Error Saving", description: errorMsg, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!course || isDeleting || isSaving) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this course? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/courses/${courseId}`);
      toast({ title: "Success", description: "Course deleted successfully.", type: "success" });
      router.push('/educator');

    } catch (err: any) {
      console.error('Error deleting course:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to delete course';
      toast({ title: "Error Deleting", description: errorMsg, type: "error" });
    } finally {
      setIsDeleting(false);
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
      downloadLink.download = `${title || 'course'}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleTabChange = (tab: 'basic' | 'share' | 'settings') => {
    setActiveTab(tab);
  };

  if (isLoading || isUserLoading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading course editor...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorMessage}>
            {error || 'Unable to load the course information.'}
          </p>
          <Link href="/educator">
            <button className={styles.button}>Back to Educator Dashboard</button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.courseEditPage}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Edit Course: {course.title}</h1>
            <div className={styles.actions}>
              <Link href={`/course/${course.id}`}>
                <button className={styles.buttonSecondary}>View Course</button>
              </Link>
              <button
                className={styles.buttonPrimary}
                onClick={handleSubmit}
                disabled={isSaving || isDeleting}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className={styles.tabNav}>
            <button
              className={`${styles.tabButton} ${activeTab === 'basic' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('basic')}
            >
              Basic Information
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
                    <option value="">Select Category</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="language">Language</option>
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder.png';
                          setImageUrl('/placeholder.png');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'share' && (
              <div className={styles.shareTab}>
                <h3 className={styles.shareTitle}>Share Your Course</h3>
                <p className={styles.shareDescription}>
                  Use this QR code or link to easily share your course.
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
                          toast({ title: "Link Copied!", type: "success" });
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
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
                      className={styles.buttonDanger}
                      onClick={handleDelete}
                      disabled={isDeleting || isSaving}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Course'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}