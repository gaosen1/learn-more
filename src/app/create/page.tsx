'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from "@/components/layout/MainLayout";
import styles from "./page.module.css";
import api from '@/utils/api';
import { useToast } from '@/components/ui/toast';

// 课程部分和课时的接口定义
interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function CreateCourse() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    imageUrl: ''
  });
  
  // 课程部分状态
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSectionForm, setShowSectionForm] = useState(false);
  
  // 课时状态
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [editingSectionForLesson, setEditingSectionForLesson] = useState<string | null>(null);
  
  // --- CSV Upload State --- 
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  // --- End CSV Upload State ---

  // 用户和权限状态
  const [userChecked, setUserChecked] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 检查用户权限
  useEffect(() => {
    let isMounted = true;
    
    const checkUserPermission = async () => {
      setIsLoadingAuth(true);
      try {
        console.log("Create Course: Checking user auth via /api/auth/me");
        const response = await api.get('/auth/me');
        const user = response.data.user;

        if (!isMounted) return;

        if (user && user.role === 'EDUCATOR') {
          console.log("Create Course: User is Educator. Access granted.");
          setUserChecked(true);
        } else {
          console.log("Create Course: User is not an Educator or not logged in.");
          toast({ 
              title: "Access Denied", 
              description: "Only educators can create courses. Redirecting...", 
              type: "error"
          });
          router.push('/dashboard');
        }

      } catch (error: any) {
        if (!isMounted) return;
        console.error('Create Course: Error checking user permission:', error);
        toast({ 
            title: "Authentication Required", 
            description: "Please log in as an educator to create a course. Redirecting...", 
            type: "error"
        });
        router.push('/login?redirect=/create'); 
      } finally {
         if (isMounted) {
            setIsLoadingAuth(false);
         }
      }
    };
    
    checkUserPermission();
    
    return () => { isMounted = false; };

  }, [router, toast]);

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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // 添加课程部分
  const addSection = () => {
    setShowSectionForm(true);
  };
  
  // 保存新课程部分
  const saveSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: Section = {
      id: Date.now().toString(),
      title: newSectionTitle,
      lessons: []
    };
    
    setSections([...sections, newSection]);
    setNewSectionTitle('');
    setShowSectionForm(false);
  };
  
  // 取消添加课程部分
  const cancelAddSection = () => {
    setNewSectionTitle('');
    setShowSectionForm(false);
  };
  
  // 编辑课程部分
  const editSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setNewSectionTitle(section.title);
    }
  };
  
  // 保存编辑的课程部分
  const saveEditSection = () => {
    if (!editingSectionId || !newSectionTitle.trim()) return;
    
    setSections(sections.map(section => 
      section.id === editingSectionId 
        ? { ...section, title: newSectionTitle } 
        : section
    ));
    
    setEditingSectionId(null);
    setNewSectionTitle('');
  };
  
  // 删除课程部分
  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };
  
  // 添加课时
  const addLesson = (sectionId: string) => {
    setEditingLessonId(null);
    setEditingSectionForLesson(sectionId);
    setNewLessonTitle('');
    setNewLessonContent('');
  };
  
  // 保存新课时
  const saveLesson = () => {
    if (!editingSectionForLesson || !newLessonTitle.trim()) return;
    
    const section = sections.find(s => s.id === editingSectionForLesson);
    if (!section) return;
    
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: newLessonTitle,
      content: newLessonContent,
      order: section.lessons.length + 1
    };
    
    setSections(sections.map(s => 
      s.id === editingSectionForLesson 
        ? { ...s, lessons: [...s.lessons, newLesson] } 
        : s
    ));
    
    setEditingSectionForLesson(null);
    setNewLessonTitle('');
    setNewLessonContent('');
  };
  
  // 编辑课时
  const editLesson = (sectionId: string, lessonId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const lesson = section.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    setEditingLessonId(lessonId);
    setEditingSectionForLesson(sectionId);
    setNewLessonTitle(lesson.title);
    setNewLessonContent(lesson.content);
  };
  
  // 保存编辑的课时
  const saveEditLesson = () => {
    if (!editingSectionForLesson || !editingLessonId || !newLessonTitle.trim()) return;
    
    setSections(sections.map(section => 
      section.id === editingSectionForLesson 
        ? {
            ...section,
            lessons: section.lessons.map(lesson => 
              lesson.id === editingLessonId 
                ? { ...lesson, title: newLessonTitle, content: newLessonContent }
                : lesson
            )
          }
        : section
    ));
    
    setEditingLessonId(null);
    setEditingSectionForLesson(null);
    setNewLessonTitle('');
    setNewLessonContent('');
  };
  
  // 删除课时
  const deleteLesson = (sectionId: string, lessonId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, lessons: section.lessons.filter(lesson => lesson.id !== lessonId) }
        : section
    ));
  };
  
  // 取消编辑课时
  const cancelEditLesson = () => {
    setEditingLessonId(null);
    setEditingSectionForLesson(null);
    setNewLessonTitle('');
    setNewLessonContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit function called');
    
    // Form validation (remains the same)
    if (!formData.title || !formData.description || !formData.category) {
      toast({ title: "Missing Fields", description: "Please fill in course title, description, and category.", type: "error" });
      setCurrentStep(1); // Go back to step 1 if basic info is missing
      return;
    }
    
    if (sections.length === 0) {
       toast({ title: "No Sections", description: "Please add at least one section to the course.", type: "error" });
       setCurrentStep(2); // Go to step 2
       return;
    }
    
    // Check for empty sections (optional confirmation)
    const emptySections = sections.filter(section => section.lessons.length === 0);
    if (emptySections.length > 0) {
      if (!confirm(`The following sections have no lessons: ${emptySections.map(s => s.title).join(', ')}. Continue creating the course?`)) {
        setCurrentStep(2); // Stay on step 2
        return;
      }
    }
    
    // Add submitting state if needed
    // setIsSubmitting(true); 

    try {
      // Build course data (ensure default image URL if none provided)
      const courseData = {
        ...formData,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' 
      };
      
      console.log('Preparing to create course with data:', courseData);
      
      // --- Create the new course using api instance --- 
      const courseResponse = await api.post('/courses', courseData);
      // Note: api instance should automatically handle headers/cookies
      
      console.log('Course creation API response status:', courseResponse.status);
      // Assuming api instance throws error on non-2xx status
      
      const courseResult = courseResponse.data; // Assuming data is in response.data
      console.log('Course created successfully:', courseResult);
      
      let hasErrorInSectionOrLesson = false;
      let createdSections = 0;
      let createdLessons = 0;
      
      // --- Create sections and lessons --- 
      for (const section of sections) {
        try {
          console.log('Creating section:', section.title);
          // Use api instance for creating section
          const sectionResponse = await api.post(
              `/courses/${courseResult.id}/sections`,
              { title: section.title, order: sections.indexOf(section) + 1 } // Pass order explicitly
          );
          
          console.log('Section creation API response status:', sectionResponse.status);
          const sectionResult = sectionResponse.data;
          console.log('Section created successfully:', sectionResult);
          createdSections++;
          
          // Create lessons for this section
          for (const lesson of section.lessons) {
            try {
              console.log('Creating lesson:', lesson.title, 'for section:', sectionResult.id);
              // Use api instance for creating lesson
              const lessonResponse = await api.post(
                  // Ensure using correct endpoint (could be /courses/[id]/lessons or /courses/[id]/sections/[sid]/lessons)
                  // Using /courses/[id]/lessons as per previous check:
                  `/courses/${courseResult.id}/lessons`, 
                  {
                    title: lesson.title,
                    content: lesson.content,
                    order: lesson.order, // Use order from state
                    sectionId: sectionResult.id // Use the ID of the just-created section
                  }
              );
              
              console.log('Lesson creation API response status:', lessonResponse.status);
              const lessonResult = lessonResponse.data;
              console.log('Lesson created successfully:', lessonResult);
              createdLessons++;
              
            } catch (lessonError: any) {
              console.error('Error creating lesson:', lesson.title, lessonError.response?.data || lessonError.message);
              hasErrorInSectionOrLesson = true;
              // Optionally break or continue depending on desired behavior
            }
          }
        } catch (sectionError: any) {
          console.error('Error creating section:', section.title, sectionError.response?.data || sectionError.message);
          hasErrorInSectionOrLesson = true;
          // Optionally break or continue
        }
      }
      
      console.log('Course, sections, and lessons creation process finished.');
      console.log(`Summary: ${createdSections} sections, ${createdLessons} lessons attempted.`);
      
      if (hasErrorInSectionOrLesson) {
         toast({ 
            title: "Course Created (with issues)", 
            description: "Course info saved, but some sections/lessons failed. Please check and edit the course.", 
            type: "warning"
         });
      } else {
         toast({ title: "Success!", description: "Course created successfully!", type: "success" });
      }
      
      // Redirect to the newly created course page or dashboard
      // router.push(`/course/${courseResult.id}`); // Option 1: Go to course page
      router.push('/dashboard'); // Option 2: Go to dashboard

    } catch (error: any) {
      console.error('Error during course creation process:', error);
      toast({ 
          title: "Course Creation Failed", 
          description: error.response?.data?.error || error.message || "An unexpected error occurred.", 
          type: "error"
      });
    } finally {
       // Reset submitting state if used
       // setIsSubmitting(false);
    }
  };

  // --- CSV Upload Handlers --- 
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null); // Clear previous errors
    setSelectedFileName(null); // Clear previous file name
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'text/csv') {
      setFileUploadError('Invalid file type. Please upload a .csv file.');
      // Reset the input value so the user can select the same file again if needed after error
      e.target.value = ''; 
      return;
    }
    
    setSelectedFileName(file.name); // Set the selected file name

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      if (csvContent) {
        parseCsvAndUpdateSections(csvContent);
      } else {
        setFileUploadError('Failed to read file content.');
        setIsParsingCsv(false);
      }
    };
    reader.onerror = () => {
      setFileUploadError('Error reading file.');
      setIsParsingCsv(false);
    };
    reader.readAsText(file);
  };

  // --- CSV Parsing and Update Logic --- 
  const parseCsvAndUpdateSections = (csvContent: string) => {
    setIsParsingCsv(true); // Ensure loading state is active
    setFileUploadError(null);

    try {
      const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== ''); // Split lines and remove empty ones
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header and one data row.');
      }

      const header = lines[0].split(',').map(h => h.trim());
      const expectedHeader = ['Type', 'Title', 'Content', 'Section Title'];
      if (header.length !== expectedHeader.length || !header.every((h, i) => h === expectedHeader[i])) {
        throw new Error(`Invalid CSV header. Expected: ${expectedHeader.join(',')} Found: ${lines[0]}`);
      }

      const newSections: Section[] = [];
      const sectionMap = new Map<string, Section>(); // To quickly find sections by title for adding lessons

      for (let i = 1; i < lines.length; i++) {
        // Basic CSV parsing (doesn't handle quoted commas perfectly, assumes simple structure)
        // TODO: Implement a more robust CSV parser if needed for complex content
        const values = lines[i].split(','); 
        if (values.length !== header.length) {
            console.warn(`Skipping row ${i + 1}: Incorrect number of columns. Expected ${header.length}, found ${values.length}. Line: ${lines[i]}`);
            continue; // Skip rows with incorrect column count
        }
        
        const row = header.reduce((obj, col, index) => {
            obj[col] = values[index]?.trim() ?? '';
            return obj;
        }, {} as { [key: string]: string });

        const type = row['Type']?.toLowerCase();
        const title = row['Title'];
        const content = row['Content'];
        const sectionTitle = row['Section Title'];

        if (!title) {
          throw new Error(`Row ${i + 1}: Title cannot be empty.`);
        }

        if (type === 'section') {
          if (sectionMap.has(title)) {
            throw new Error(`Row ${i + 1}: Duplicate section title "${title}".`);
          }
          const newSection: Section = {
            id: `csv-${Date.now()}-${i}`, // Generate unique ID
            title: title,
            lessons: []
          };
          newSections.push(newSection);
          sectionMap.set(title, newSection);
        } else if (type === 'lesson') {
          if (!sectionTitle) {
            throw new Error(`Row ${i + 1}: 'Section Title' cannot be empty for type 'lesson'.`);
          }
          const targetSection = sectionMap.get(sectionTitle);
          if (!targetSection) {
            throw new Error(`Row ${i + 1}: Section title "${sectionTitle}" not found or defined before this lesson.`);
          }
          const newLesson: Lesson = {
            id: `csv-${Date.now()}-${i}`, // Generate unique ID
            title: title,
            content: content || '', // Use content or default to empty string
            order: targetSection.lessons.length + 1
          };
          targetSection.lessons.push(newLesson);
        } else {
          throw new Error(`Row ${i + 1}: Invalid type "${type}". Must be 'section' or 'lesson'.`);
        }
      }
      
      if (newSections.length === 0) {
          throw new Error('No valid sections or lessons found in the CSV.');
      }

      // --- Confirmation --- 
      const confirmed = window.confirm(
        `Successfully parsed ${newSections.length} sections and ${newSections.reduce((sum, s) => sum + s.lessons.length, 0)} lessons. \n\nThis will REPLACE your current course structure. Are you sure?`
      );

      if (confirmed) {
        setSections(newSections);
        toast({ title: "Success", description: "Course structure updated from CSV.", type: "success" });
        // --- Add navigation to the next step --- 
        goToCourseInfoStep(); // Navigate to Step 2 (Course Info)
        // --- End navigation --- 
      } else {
        toast({ title: "Cancelled", description: "CSV upload cancelled.", type: "info" });
      }

    } catch (error: any) {
      console.error("Error parsing CSV:", error);
      setFileUploadError(`Error parsing CSV: ${error.message}`);
      toast({ title: "CSV Error", description: error.message, type: "error" });
      setSelectedFileName(null); // Clear file name on error
    } finally {
      setIsParsingCsv(false);
    }
  };
  // --- End CSV Parsing and Update Logic ---

  // --- Sample CSV Download Logic --- 
  const sampleCsvContent = 
`Type,Title,Content,Section Title
section,"Module 1: Introduction",,
lesson,"What is This Course About?","Course overview and goals.","Module 1: Introduction"
lesson,"Setting Up Your Environment","Instructions for installing necessary tools.","Module 1: Introduction"
section,"Module 2: Core Concepts",,
lesson,"Understanding Variables","Explanation of variables in programming.","Module 2: Core Concepts"
lesson,"Data Types Explained","Covering strings, numbers, booleans, etc.","Module 2: Core Concepts"
`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'course_structure_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // --- End Sample CSV Download Logic ---

  // --- Step Rendering --- 
  
  // *** NEW: Step 1 - Creation Method ***
  const renderStep1_CreationMethod = () => (
    <div className={`${styles.stepContent}`}>
      <h2 className={styles.stepTitle}>Step 1: Choose Creation Method</h2>
      
      <div className={styles.optionsContainer}>
        <div className={styles.creationOptionCard}>
          <h3 className={styles.subheading}>Manual Creation</h3>
          <p className={styles.description}>Build your course step-by-step, adding sections and lessons manually.</p>
          <button 
            type="button" 
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={goToCourseInfoStep}
          >
            Start Manual Creation
          </button>
        </div>

        <div className={styles.creationOptionCard}>
          <h3 className={styles.subheading}>Upload from CSV</h3>
          <p className={styles.description}>Define your course structure (sections and lessons) quickly by uploading a CSV file. This will pre-fill the structure for Step 3.</p>
          <p className={styles.descriptionSmall}> 
             CSV Format: <code className={styles.code}>Type,Title,Content,Section Title</code>
             {' '}
             <a 
               href="#" 
               onClick={(e) => { e.preventDefault(); downloadSampleCsv(); }}
               className={styles.downloadLink} 
             >
               Download Sample
             </a>
          </p>
          <div className={styles.uploadArea} style={{ marginTop: '15px'}}> 
            <input 
              type="file"
              accept=".csv"
              id="csv-upload"
              className={styles.fileInputHidden} 
              onChange={handleFileUpload}
              disabled={isParsingCsv}
              onClick={(event: React.MouseEvent<HTMLInputElement>) => {
                const element = event.target as HTMLInputElement;
                element.value = '';
              }}
            />
            <label 
              htmlFor="csv-upload" 
              className={`${styles.button} ${styles.uploadButton} ${isParsingCsv ? styles.disabled : ''}`}
            >
              {isParsingCsv ? (
                <>Processing... <span className={styles.spinner}></span></> 
              ) : (
                'Choose & Upload CSV' 
              )}
            </label>
            {selectedFileName && !isParsingCsv && (
              <span className={styles.fileNameDisplay}>{selectedFileName}</span>
            )}
          </div>
          {fileUploadError && (
            <p className={`${styles.errorMessage} ${styles.errorMessageCompact}`}>{fileUploadError}</p>
          )}
          {isParsingCsv && (
            <p className={`${styles.loadingMessage} ${styles.loadingMessageCompact}`}>
              Processing {selectedFileName ? `"${selectedFileName}"` : 'file'}, please wait...
            </p>
          )}
        </div>
      </div>
    </div>
  );
  // *** END: Step 1 ***

  // *** Step 2 (Old Step 1) - Course Info ***
  const renderStep2_CourseInfo = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Step 2: Course Information</h2>
      
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

      <div className={styles.formGroup}>
        <label htmlFor="imageUrl" className={styles.label}>Course Image URL</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          className={styles.input}
          placeholder="https://example.com/image.jpg"
          value={formData.imageUrl}
          onChange={handleChange}
        />
        <p className={styles.hint}>Leave empty to use a default image</p>
      </div>

      <div className={styles.formActions}>
        <button type="button" className="btn btn-outline" onClick={prevStep}>
          Choose Method
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          Next: Course Structure
        </button>
      </div>
    </div>
  );
  // *** END: Step 2 ***

  // *** Step 3 (Old Step 2) - Course Structure (Manual Editor Only) ***
  const renderStep3_CourseStructure = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Step 3: Course Structure</h2>
      
      <h3 className={styles.subheading}>Manual Structure Editor</h3>
      <p className={styles.description}>Add sections and lessons to build your course content. {sections.length > 0 ? 'The structure might be pre-filled if you uploaded a CSV.': ''}</p>

      {/* Existing Section Management UI */}
      <div className={styles.sectionManagement}>
        <h3 className={styles.sectionTitle}>Course Sections</h3>
        <p className={styles.sectionDescription}>
          In this step, you can add course sections and lesson content.
        </p>
        
        {sections.length > 0 ? (
          <div className={styles.sectionsList}>
            {sections.map((section) => (
              <div key={section.id} className={styles.sectionItem}>
                <div className={styles.sectionHeader}>
                  {editingSectionId === section.id ? (
                    <div className={styles.sectionEditForm}>
                      <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className={styles.input}
                        placeholder="Section title"
                      />
                      <div className={styles.sectionEditActions}>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary"
                          onClick={saveEditSection}
                        >
                          Save
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingSectionId(null);
                            setNewSectionTitle('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className={styles.sectionItemTitle}>{section.title}</h4>
                      <div className={styles.sectionActions}>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline"
                          onClick={() => editSection(section.id)}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteSection(section.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className={styles.lessonsList}>
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className={styles.lessonItem}>
                      <div className={styles.lessonDetails}>
                        <span className={styles.lessonOrder}>{lesson.order}.</span>
                        <span className={styles.lessonTitle}>{lesson.title}</span>
                      </div>
                      <div className={styles.lessonActions}>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline"
                          onClick={() => editLesson(section.id, lesson.id)}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteLesson(section.id, lesson.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {editingSectionForLesson === section.id && editingLessonId === null && (
                    <div className={styles.lessonForm}>
                      <h5 className={styles.lessonFormTitle}>Add New Lesson</h5>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Lesson Title</label>
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className={styles.input}
                          placeholder="Enter lesson title"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Lesson Content</label>
                        <textarea
                          value={newLessonContent}
                          onChange={(e) => setNewLessonContent(e.target.value)}
                          className={styles.textarea}
                          rows={4}
                          placeholder="Enter lesson content"
                        ></textarea>
                      </div>
                      <div className={styles.lessonFormActions}>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary"
                          onClick={saveLesson}
                        >
                          Save Lesson
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline"
                          onClick={cancelEditLesson}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {editingSectionForLesson === section.id && editingLessonId !== null && (
                    <div className={styles.lessonForm}>
                      <h5 className={styles.lessonFormTitle}>Edit Lesson</h5>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Lesson Title</label>
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className={styles.input}
                          placeholder="Enter lesson title"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Lesson Content</label>
                        <textarea
                          value={newLessonContent}
                          onChange={(e) => setNewLessonContent(e.target.value)}
                          className={styles.textarea}
                          rows={4}
                          placeholder="Enter lesson content"
                        ></textarea>
                      </div>
                      <div className={styles.lessonFormActions}>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-primary"
                          onClick={saveEditLesson}
                        >
                          Update Lesson
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline"
                          onClick={cancelEditLesson}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {editingSectionForLesson !== section.id && (
                    <button 
                      type="button" 
                      className={styles.addLessonButton}
                      onClick={() => addLesson(section.id)}
                    >
                      + Add Lesson
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        
        {showSectionForm ? (
          <div className={styles.sectionForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Section Title</label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className={styles.input}
                placeholder="e.g. Introduction to JavaScript"
              />
            </div>
            <div className={styles.sectionFormActions}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={saveSection}
              >
                Add Section
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={cancelAddSection}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={styles.sectionPlaceholder}
            onClick={addSection}
          >
            <div className={styles.placeholderIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <p>Click to add section</p>
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="button" className="btn btn-outline" onClick={prevStep}>
          Previous: Course Info
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          onClick={(e) => {
            console.log('提交按钮被点击');
            handleSubmit(e);
          }}
          disabled={sections.length === 0}
        >
          Create Course
        </button>
      </div>
    </div>
  );
  // *** END: Step 3 ***

  // *** Step 4 (Old Step 3) - Publish Settings ***
  const renderStep4_PublishSettings = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Step 4: Publish Settings</h2>
      
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
          <span className={styles.summaryLabel}>Sections:</span>
          <span className={styles.summaryValue}>{sections.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Lessons:</span>
          <span className={styles.summaryValue}>
            {sections.reduce((total, section) => total + section.lessons.length, 0)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Visibility:</span>
          <span className={styles.summaryValue}>{formData.isPublic ? 'Public' : 'Private'}</span>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className="btn btn-outline" onClick={prevStep}>
          Previous: Course Structure
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          onClick={(e) => {
            console.log('提交按钮被点击');
            handleSubmit(e);
          }}
          disabled={sections.length === 0}
        >
          Create Course
        </button>
      </div>
    </div>
  );
  // *** END: Step 4 ***

  // --- Go to Step 2 (Course Info) ---
  const goToCourseInfoStep = () => {
      setCurrentStep(2);
  };

  return (
    <MainLayout>
      {isLoadingAuth ? (
        <div className={styles.loading}>
          <p>Verifying permissions...</p>
        </div>
      ) : !userChecked ? (
        <div className={styles.loading}>
          <p>Permission check failed or redirecting...</p>
        </div>
      ) : (
        <div className={styles.createCourse}>
          <div className="container">
            <div className={styles.header}>
              <h1 className={styles.title}>Create New Course</h1>
            </div>

            <div className={styles.stepsContainer}>
              <div className={styles.steps}>
                <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                  <div className={styles.stepNumber}>1</div>
                  <span className={styles.stepLabel}>Method</span>
                </div>
                <div className={styles.stepDivider}></div>
                <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                  <div className={styles.stepNumber}>2</div>
                  <span className={styles.stepLabel}>Info</span>
                </div>
                <div className={styles.stepDivider}></div>
                <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                  <div className={styles.stepNumber}>3</div>
                  <span className={styles.stepLabel}>Structure</span>
                </div>
                <div className={styles.stepDivider}></div>
                <div className={`${styles.step} ${currentStep >= 4 ? styles.active : ''}`}>
                  <div className={styles.stepNumber}>4</div>
                  <span className={styles.stepLabel}>Publish</span>
                </div>
              </div>
            </div>

            <div className={styles.formContainer}>
              {currentStep === 1 && renderStep1_CreationMethod()}
              {currentStep === 2 && renderStep2_CourseInfo()}
              {currentStep === 3 && renderStep3_CourseStructure()}
              {currentStep === 4 && renderStep4_PublishSettings()}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
} 