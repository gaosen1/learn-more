'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/layout/MainLayout";
import styles from "./page.module.css";

export default function CreateCourse() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Course data:', formData);
    // API call to save the course would go here
    // Redirect after successful save
    router.push('/dashboard');
  };

  return (
    <MainLayout>
      <div className={styles.createCourse}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Create New Course</h1>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.steps}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <span className={styles.stepLabel}>Course Info</span>
              </div>
              <div className={styles.stepDivider}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>2</div>
                <span className={styles.stepLabel}>Course Structure</span>
              </div>
              <div className={styles.stepDivider}></div>
              <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>3</div>
                <span className={styles.stepLabel}>Publish Settings</span>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            {currentStep === 1 && (
              <div className={styles.step1}>
                <div className={styles.formGroup}>
                  <label htmlFor="title" className={styles.label}>Course Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className={styles.input}
                    placeholder="Example: JavaScript Programming Basics"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.label}>Course Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className={styles.textarea}
                    placeholder="Describe your course content and learning objectives..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                  ></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="category" className={styles.label}>Course Category</label>
                  <select
                    id="category"
                    name="category"
                    className={styles.select}
                    value={formData.category}
                    onChange={handleChange}
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

                <div className={styles.formActions}>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.step2}>
                <div className={styles.sectionsEditor}>
                  <h3 className={styles.sectionTitle}>Course Sections</h3>
                  <p className={styles.sectionDescription}>
                    In this step, you can add course sections and lesson content.
                  </p>
                  
                  <div className={styles.sectionPlaceholder}>
                    <div className={styles.placeholderIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <p>Click to add section</p>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className="btn btn-outline" onClick={prevStep}>
                    Previous Step
                  </button>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.step3}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                    <span>Make course public</span>
                  </label>
                  <p className={styles.checkboxDescription}>
                    Public courses can be accessed by anyone and you can generate sharing links and QR codes.
                  </p>
                </div>

                <div className={styles.summarySection}>
                  <h3 className={styles.summaryTitle}>Course Information Summary</h3>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Course Title:</span>
                    <span className={styles.summaryValue}>{formData.title || 'Not provided'}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Category:</span>
                    <span className={styles.summaryValue}>{formData.category || 'Not selected'}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Visibility:</span>
                    <span className={styles.summaryValue}>{formData.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className="btn btn-outline" onClick={prevStep}>
                    Previous Step
                  </button>
                  <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                    Create Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 