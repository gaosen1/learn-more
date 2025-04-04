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

// 获取所有公开课程或用户有权访问的课程
export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    // 查询条件：公开课程或用户为课程作者
    let whereClause: any = { isPublic: true };
    
    // 如果用户已登录，包含其创建的非公开课程
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
    
    // 转换课程数据以适应前端结构
    const formattedCourses = courses.map(course => {
      const lessonCount = course.lessons.length;
      const enrolledUserCount = course.enrolledUsers.length;
      
      // 查找当前用户注册信息（如果已登录）
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
            ? JSON.parse(userEnrollment.completedLessonIds).includes(lesson.id)
            : false
        })),
        progress: userEnrollment ? userEnrollment.progress : 0,
        completedLessons: userEnrollment ? userEnrollment.completedLessons : 0,
        isEnrolled: !!userEnrollment
      };
    });
    
    return NextResponse.json(formattedCourses);
    
  } catch (error) {
    console.error('获取课程错误:', error);
    return NextResponse.json(
      { error: '获取课程列表时发生错误' },
      { status: 500 }
    );
  }
}

// 创建新课程（仅教育者角色）
export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    // 验证用户是否已登录且为教育者
    if (!currentUser) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      );
    }
    
    // 验证用户角色是否为教育者
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: '只有教育者可以创建课程' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, imageUrl, category, isPublic = false, lessons = [] } = body;
    
    // 验证必填字段
    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: '标题、描述、图片和分类为必填项' },
        { status: 400 }
      );
    }
    
    // 创建新课程及相关课程章节
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        isPublic,
        authorId: currentUser.id,
        lessons: {
          create: lessons.map((lesson: { title: string }, index: number) => ({
            title: lesson.title,
            order: index,
            content: ''
          }))
        }
      },
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
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    // 格式化响应数据
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
      updatedAt: newCourse.updatedAt.toISOString(),
      lessons: newCourse.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        completed: false
      })),
      progress: 0,
      completedLessons: 0,
      isEnrolled: false
    };
    
    return NextResponse.json(formattedCourse, { status: 201 });
    
  } catch (error) {
    console.error('创建课程错误:', error);
    return NextResponse.json(
      { error: '创建课程时发生错误' },
      { status: 500 }
    );
  }
} 