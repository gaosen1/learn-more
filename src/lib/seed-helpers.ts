import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * Create rich test data for development environment
 * Only used in development environment
 */
export async function seedDevelopmentData(prisma: PrismaClient, adminId: number) {
  // Create test users
  const users = await createTestUsers(prisma);
  
  // Create additional test courses
  const courses = await createTestCourses(prisma, adminId, users);
  
  // Create user course enrollments
  await createUserCourseEnrollments(prisma, users, courses);
  
  return { users, courses };
}

/**
 * Create test users
 */
async function createTestUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('Password123', 10);
  
  const users: User[] = [];
  
  // Create student users
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        name: `Student ${i}`,
        password: hashedPassword,
        role: 'STUDENT',
        avatar: `https://ui-avatars.com/api/?name=Student+${i}&background=random`,
      },
    });
    users.push(user);
  }
  
  // Create educator users
  for (let i = 1; i <= 2; i++) {
    const user = await prisma.user.create({
      data: {
        email: `educator${i}@example.com`,
        name: `Educator ${i}`,
        password: hashedPassword,
        role: 'EDUCATOR',
        avatar: `https://ui-avatars.com/api/?name=Educator+${i}&background=random`,
      },
    });
    users.push(user);
  }
  
  return users;
}

/**
 * Create test courses
 */
async function createTestCourses(prisma: PrismaClient, adminId: number, users: User[]) {
  const courses: any[] = [];
  
  // Find educator users
  const educators = users.filter(user => user.role === 'EDUCATOR');
  const allEducators = [adminId, ...educators.map(e => e.id)];
  
  // Common course categories
  const categories = ['programming', 'design', 'business', 'languages', 'science'];
  
  // Sample course data
  const courseData = [
    {
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS and JavaScript to build websites',
      category: 'programming',
      lessons: [
        'Web Structure and HTML Tags', 
        'CSS Styling and Layout Basics', 
        'JavaScript Core Concepts'
      ]
    },
    {
      title: 'Python Data Analysis',
      description: 'Use Python to process and analyze large datasets',
      category: 'programming',
      lessons: [
        'Python Basics', 
        'Data Processing with Pandas', 
        'Data Visualization with Matplotlib', 
        'Statistical Analysis Fundamentals'
      ]
    },
    {
      title: 'UI Design Principles',
      description: 'Learn core principles of modern user interface design',
      category: 'design',
      lessons: [
        'Color Theory', 
        'Typography Basics', 
        'Layout and Space', 
        'Mobile App UI Design'
      ]
    },
    {
      title: 'Business Strategy Introduction',
      description: 'Understand core concepts for effective business strategy formulation',
      category: 'business',
      lessons: [
        'Market Analysis', 
        'Competitive Strategy', 
        'Value Proposition Design', 
        'Growth Strategies'
      ]
    },
    {
      title: 'English Business Writing',
      description: 'Improve your business English writing skills',
      category: 'languages',
      lessons: [
        'Effective Email Writing', 
        'Business Report Structure', 
        'Persuasive Writing Techniques', 
        'Common Grammar Mistakes'
      ]
    }
  ];
  
  // Create courses
  for (let i = 0; i < courseData.length; i++) {
    const course = courseData[i];
    // Randomly select an educator as author
    const authorId = allEducators[i % allEducators.length];
    
    const newCourse = await prisma.course.create({
      data: {
        title: course.title,
        description: course.description,
        imageUrl: `https://source.unsplash.com/random/900x600?${course.category.replace(' ', '+')}`,
        category: course.category,
        isPublic: Math.random() > 0.2, // 80% of courses are public
        authorId: authorId,
        // Create a default section first
        sections: {
          create: [
            {
              title: 'Course Content', // Default section name
              order: 1,
              // Create lessons within this section
              lessons: {
                create: course.lessons.map((title, index) => ({
                  title,
                  content: `This is detailed content about "${title}". It will contain complete course materials.`,
                  order: index + 1
                  // sectionId will be implicitly set here
                }))
              }
            }
          ]
        }
        // Removed direct lesson creation
        /*
        lessons: {
          create: course.lessons.map((title, index) => ({
            title,
            content: `This is detailed content about "${title}". It will contain complete course materials.`,
            order: index + 1
          }))
        }
        */
      }
    });
    
    courses.push(newCourse);
  }
  
  return courses;
}

/**
 * Create user course enrollments
 */
async function createUserCourseEnrollments(prisma: PrismaClient, users: User[], courses: any[]) {
  // Find all students
  const students = users.filter(user => user.role === 'STUDENT');
  
  // For each student, enroll in 2-4 courses
  for (const student of students) {
    // Randomly select 2-4 courses
    const numCourses = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    const selectedCourses = shuffled.slice(0, numCourses);
    
    // Create enrollments
    for (const course of selectedCourses) {
      await prisma.userCourse.create({
        data: {
          userId: student.id,
          courseId: course.id,
          enrolledAt: new Date(),
          // Random progress
          progress: Math.random() < 0.3 ? 100 : Math.floor(Math.random() * 100),
          // Empty completed lesson list as JSON string
          completedLessonIds: '[]'
        }
      });
    }
  }
} 