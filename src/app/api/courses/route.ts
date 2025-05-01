import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Sample course data - 现在设为常量，不导出
const sampleCourses = [
  {
    id: '1',
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
    imageUrl: '/course-images/web-dev.jpg',
    progress: 75,
    lessons: [
      { id: '1-1', title: 'Introduction to HTML', completed: true },
      { id: '1-2', title: 'HTML Elements and Structure', completed: true },
      { id: '1-3', title: 'CSS Fundamentals', completed: true },
      { id: '1-4', title: 'CSS Layout Models', completed: true },
      { id: '1-5', title: 'JavaScript Basics', completed: true },
      { id: '1-6', title: 'DOM Manipulation', completed: true },
      { id: '1-7', title: 'JavaScript Events', completed: true },
      { id: '1-8', title: 'Forms and Validation', completed: true },
      { id: '1-9', title: 'Making API Requests', completed: false },
      { id: '1-10', title: 'Building a Simple Web App', completed: false },
      { id: '1-11', title: 'Web Accessibility Basics', completed: false },
      { id: '1-12', title: 'Project: Portfolio Website', completed: false }
    ],
    completedLessons: 8,
    category: 'programming',
    author: 'John Smith',
    createdAt: '2023-05-15',
    updatedAt: '2023-09-20',
    isPublic: true
  },
  {
    id: '2',
    title: 'Python Programming for Beginners',
    description: 'Start learning Python programming from scratch',
    imageUrl: '/course-images/python.jpg',
    progress: 40,
    lessons: [
      { id: '2-1', title: 'Getting Started with Python', completed: true },
      { id: '2-2', title: 'Python Syntax Basics', completed: true },
      { id: '2-3', title: 'Variables and Data Types', completed: true },
      { id: '2-4', title: 'Control Flow: Conditionals', completed: true },
      { id: '2-5', title: 'Control Flow: Loops', completed: false },
      { id: '2-6', title: 'Functions in Python', completed: false },
      { id: '2-7', title: 'Working with Lists and Dictionaries', completed: false },
      { id: '2-8', title: 'File Handling', completed: false },
      { id: '2-9', title: 'Error Handling', completed: false },
      { id: '2-10', title: 'Project: Simple Command Line App', completed: false }
    ],
    completedLessons: 4,
    category: 'programming',
    author: 'Sarah Johnson',
    createdAt: '2023-06-10',
    updatedAt: '2023-10-05',
    isPublic: true
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    description: 'Understand and implement common data structures and algorithms',
    imageUrl: '/course-images/dsa.jpg',
    progress: 10,
    lessons: [
      { id: '3-1', title: 'Introduction to Algorithm Analysis', completed: true },
      { id: '3-2', title: 'Arrays and Linked Lists', completed: false },
      { id: '3-3', title: 'Stacks and Queues', completed: false },
      { id: '3-4', title: 'Trees and Binary Search Trees', completed: false },
      { id: '3-5', title: 'Heaps and Priority Queues', completed: false },
      { id: '3-6', title: 'Hash Tables', completed: false },
      { id: '3-7', title: 'Graphs and Graph Algorithms', completed: false },
      { id: '3-8', title: 'Searching Algorithms', completed: false },
      { id: '3-9', title: 'Sorting Algorithms', completed: false },
      { id: '3-10', title: 'Dynamic Programming', completed: false },
      { id: '3-11', title: 'Greedy Algorithms', completed: false },
      { id: '3-12', title: 'Advanced Topics', completed: false },
      { id: '3-13', title: 'Practical Algorithm Applications', completed: false },
      { id: '3-14', title: 'Algorithm Interview Questions', completed: false },
      { id: '3-15', title: 'Final Project: Algorithm Implementation', completed: false }
    ],
    completedLessons: 1,
    category: 'programming',
    author: 'Michael Chen',
    createdAt: '2023-07-12',
    updatedAt: '2023-11-01',
    isPublic: true
  }
];

// Get all public courses or courses the user has access to
export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    // Query condition: public courses or courses authored by the user
    let whereClause: any = { isPublic: true };
    
    // If user is logged in, include their non-public courses
    if (currentUser) {
      whereClause = {
        OR: [
          { isPublic: true },
          { authorId: currentUser.id }
        ]
      };
    }
    
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        enrolledUsers: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Convert course data to fit frontend structure
    const formattedCourses = courses.map(course => {
      const lessonCount = course.lessons.length;
      const enrolledUserCount = course.enrolledUsers.length;
      
      // Find current user's enrollment information (if logged in)
      const userEnrollment = currentUser
        ? course.enrolledUsers.find(enrollment => enrollment.userId === currentUser.id)
        : null;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        category: course.category,
        isPublic: course.isPublic,
        author: course.author.name,
        authorId: course.author.id,
        authorAvatar: course.author.avatar,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        lessons: course.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          completed: userEnrollment 
            ? JSON.parse(userEnrollment.completedLessonIds || '[]').includes(lesson.id)
            : false
        })),
        progress: userEnrollment ? userEnrollment.progress : 0,
        completedLessons: userEnrollment ? userEnrollment.completedLessons : 0,
        isEnrolled: !!userEnrollment
      };
    });
    
    return NextResponse.json(formattedCourses);
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching courses' },
      { status: 500 }
    );
  }
}

// Create new course (educator role only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    // Verify if user is logged in and is an educator
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Verify if user's role is educator
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: 'Only educators can create courses' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, imageUrl, category, isPublic = false } = body;
    
    // Validate required fields
    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Title, description, image and category are required' },
        { status: 400 }
      );
    }
    
    // Create new course
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        isPublic,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });
    
    // Format response data
    const formattedCourse = {
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      imageUrl: newCourse.imageUrl,
      category: newCourse.category,
      isPublic: newCourse.isPublic,
      author: newCourse.author.name,
      authorId: newCourse.author.id,
      authorAvatar: newCourse.author.avatar,
      createdAt: newCourse.createdAt.toISOString(),
      updatedAt: newCourse.updatedAt.toISOString()
    };
    
    return NextResponse.json(formattedCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the course' },
      { status: 500 }
    );
  }
} 