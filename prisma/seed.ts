import { PrismaClient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample image URLs
const sampleImageUrls = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
  'https://images.unsplash.com/photo-1649180556628-9ba704115795',
  'https://images.unsplash.com/photo-1559028012-481c04fa702d',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521',
];

async function main() {
  try {
    // Clear all existing data
    console.log('Clearing existing data...');
    await prisma.userCourse.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('All existing data cleared.');

    console.log('Creating sample data...');
    
    // Create sample users (educators)
    const educators = [
      { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'John Doe', email: 'john.doe@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Alex Johnson', email: 'alex.johnson@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Emma Wilson', email: 'emma.wilson@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Michael Brown', email: 'michael.brown@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Sarah Parker', email: 'sarah.parker@example.com', role: 'EDUCATOR' as UserRole },
    ];

    // Use the same password for all users to simplify the example
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create users
    const createdEducators: User[] = [];
    for (const educator of educators) {
      const user = await prisma.user.create({
        data: {
          email: educator.email,
          name: educator.name,
          password: hashedPassword,
          role: 'EDUCATOR',
          avatar: `https://ui-avatars.com/api/?name=${educator.name.replace(' ', '+')}&background=random`,
        },
      });
      createdEducators.push(user);
      console.log(`Created educator: ${user.name} (ID: ${user.id})`);
    }

    // Create a student user
    const student = await prisma.user.create({
      data: {
        email: 'student@example.com',
        name: 'Student User',
        password: hashedPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Student+User&background=random',
      },
    });
    console.log(`Created student: ${student.name} (ID: ${student.id})`);

    // Sample course data
    const coursesData = [
      {
        title: 'Web Development Basics',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build responsive websites from scratch.',
        category: 'Web Development',
        authorIndex: 0,
        lessons: [
          { title: 'Introduction to HTML', content: 'HTML basics and document structure' },
          { title: 'CSS Fundamentals', content: 'Styling web pages with CSS' },
          { title: 'JavaScript Basics', content: 'Adding interactivity with JavaScript' },
          { title: 'Responsive Design', content: 'Making websites work on all devices' },
          { title: 'Building a Simple Website', content: 'Putting it all together' },
        ],
      },
      {
        title: 'Python Programming for Beginners',
        description: 'A comprehensive introduction to Python programming language with practical exercises and projects.',
        category: 'Programming',
        authorIndex: 1,
        lessons: [
          { title: 'Python Setup and Environment', content: 'Installing Python and setting up your environment' },
          { title: 'Variables and Data Types', content: 'Understanding Python data types and variables' },
          { title: 'Control Flow', content: 'Conditions and loops in Python' },
          { title: 'Functions and Modules', content: 'Creating reusable code with functions' },
          { title: 'Working with Files', content: 'Reading and writing files in Python' },
        ],
      },
      {
        title: 'Data Structures and Algorithms',
        description: 'Understand and implement common data structures and algorithms to solve complex programming challenges.',
        category: 'Computer Science',
        authorIndex: 2,
        lessons: [
          { title: 'Introduction to Data Structures', content: 'Overview of common data structures' },
          { title: 'Arrays and Linked Lists', content: 'Implementing and using arrays and linked lists' },
          { title: 'Stacks and Queues', content: 'Stack and queue operations and implementations' },
          { title: 'Trees and Graphs', content: 'Tree and graph data structures' },
          { title: 'Sorting and Searching Algorithms', content: 'Common sorting and searching techniques' },
        ],
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Master the fundamentals of user interface and user experience design to create intuitive and engaging applications.',
        category: 'Design',
        authorIndex: 3,
        lessons: [
          { title: 'Introduction to UI/UX', content: 'Understanding the difference between UI and UX' },
          { title: 'User Research', content: 'Methods for researching user needs' },
          { title: 'Wireframing and Prototyping', content: 'Creating wireframes and interactive prototypes' },
          { title: 'Visual Design Principles', content: 'Color theory, typography, and layout' },
          { title: 'Usability Testing', content: 'Testing designs with real users' },
        ],
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning concepts, algorithms, and practical applications using Python.',
        category: 'Data Science',
        authorIndex: 4,
        lessons: [
          { title: 'Introduction to Machine Learning', content: 'Basic concepts and types of machine learning' },
          { title: 'Data Preprocessing', content: 'Preparing data for machine learning models' },
          { title: 'Supervised Learning', content: 'Classification and regression techniques' },
          { title: 'Unsupervised Learning', content: 'Clustering and dimensionality reduction' },
          { title: 'Model Evaluation', content: 'Assessing model performance' },
        ],
      },
      {
        title: 'Mobile App Development with React Native',
        description: 'Build cross-platform mobile applications using React Native framework and JavaScript.',
        category: 'Mobile Development',
        authorIndex: 5,
        lessons: [
          { title: 'Setting Up React Native', content: 'Installing and configuring React Native' },
          { title: 'React Native Components', content: 'Understanding core components' },
          { title: 'Navigation', content: 'Implementing navigation in React Native apps' },
          { title: 'State Management', content: 'Managing state with Redux or Context API' },
          { title: 'Deploying React Native Apps', content: 'Publishing to app stores' },
        ],
      },
    ];

    // Create courses and their lessons
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i];
      const author = createdEducators[courseData.authorIndex];

      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          imageUrl: sampleImageUrls[i % sampleImageUrls.length],
          category: courseData.category,
          isPublic: true,
          authorId: author.id,
          lessons: {
            create: courseData.lessons.map((lesson, index) => ({
              title: lesson.title,
              content: lesson.content,
              order: index + 1,
            })),
          },
        },
        include: {
          lessons: true,
        },
      });

      console.log(`Created course: ${course.title} (ID: ${course.id}) with ${course.lessons.length} lessons`);

      // Enroll the student in this course (only for some courses)
      if (i % 2 === 0) {
        // Store completed lesson IDs as JSON string
        const completedLessonIds = course.lessons.slice(0, 2).map(lesson => lesson.id);
        
        await prisma.userCourse.create({
          data: {
            userId: student.id,
            courseId: course.id,
            progress: Math.round((2 / course.lessons.length) * 100),
            completedLessons: 2,
            completedLessonIds: JSON.stringify(completedLessonIds),
          },
        });

        console.log(`Student ${student.name} enrolled in course: ${course.title}`);
      }
    }

    console.log('Sample data creation completed!');
  } catch (error) {
    console.error('Error in seed script:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 