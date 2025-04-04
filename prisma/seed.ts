import { PrismaClient, User, UserRole, Lesson } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 示例图片URL
const sampleImageUrls = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
  'https://images.unsplash.com/photo-1649180556628-9ba704115795',
  'https://images.unsplash.com/photo-1559028012-481c04fa702d',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521',
];

async function main() {
  // 检查数据库中是否已有课程数据
  const courseCount = await prisma.course.count();
  
  if (courseCount > 0) {
    console.log('数据库中已有课程数据，跳过种子数据创建');
    return;
  }

  console.log('开始创建示例数据...');
  
  // 创建示例用户 (教育者)
  const educators = [
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'EDUCATOR' as UserRole },
    { name: 'John Doe', email: 'john.doe@example.com', role: 'EDUCATOR' as UserRole },
    { name: 'Alex Johnson', email: 'alex.johnson@example.com', role: 'EDUCATOR' as UserRole },
    { name: 'Emma Wilson', email: 'emma.wilson@example.com', role: 'EDUCATOR' as UserRole },
    { name: 'Michael Brown', email: 'michael.brown@example.com', role: 'EDUCATOR' as UserRole },
    { name: 'Sarah Parker', email: 'sarah.parker@example.com', role: 'EDUCATOR' as UserRole },
  ];

  // 对所有用户使用相同的密码以简化示例
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 创建用户
  const createdEducators: User[] = [];
  for (const educator of educators) {
    const user = await prisma.user.upsert({
      where: { email: educator.email },
      update: {},
      create: {
        email: educator.email,
        name: educator.name,
        password: hashedPassword,
        role: 'EDUCATOR',
        avatar: `https://ui-avatars.com/api/?name=${educator.name.replace(' ', '+')}&background=random`,
      },
    });
    createdEducators.push(user);
    console.log(`Established educator: ${user.name}`);
  }

  // 创建一个学生用户
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      password: hashedPassword,
      role: 'STUDENT',
      avatar: 'https://ui-avatars.com/api/?name=Student+User&background=random',
    },
  });
  console.log(`Created student: ${student.name}`);

  // 示例课程数据
  const coursesData = [
    {
      title: 'Web Development Basics',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build responsive websites from scratch.',
      category: 'Web Development',
      authorIndex: 0,
      lessons: [
        { title: 'Introduction to HTML', content: 'HTML basics and document structure', order: 1 },
        { title: 'CSS Fundamentals', content: 'Styling web pages with CSS', order: 2 },
        { title: 'JavaScript Basics', content: 'Adding interactivity with JavaScript', order: 3 },
        { title: 'Responsive Design', content: 'Making websites work on all devices', order: 4 },
        { title: 'Building a Simple Website', content: 'Putting it all together', order: 5 },
      ],
    },
    {
      title: 'Python Programming for Beginners',
      description: 'A comprehensive introduction to Python programming language with practical exercises and projects.',
      category: 'Programming',
      authorIndex: 1,
      lessons: [
        { title: 'Python Setup and Environment', content: 'Installing Python and setting up your environment', order: 1 },
        { title: 'Variables and Data Types', content: 'Understanding Python data types and variables', order: 2 },
        { title: 'Control Flow', content: 'Conditions and loops in Python', order: 3 },
        { title: 'Functions and Modules', content: 'Creating reusable code with functions', order: 4 },
        { title: 'Working with Files', content: 'Reading and writing files in Python', order: 5 },
      ],
    },
    {
      title: 'Data Structures and Algorithms',
      description: 'Understand and implement common data structures and algorithms to solve complex programming challenges.',
      category: 'Computer Science',
      authorIndex: 2,
      lessons: [
        { title: 'Introduction to Data Structures', content: 'Overview of common data structures', order: 1 },
        { title: 'Arrays and Linked Lists', content: 'Implementing and using arrays and linked lists', order: 2 },
        { title: 'Stacks and Queues', content: 'Stack and queue operations and implementations', order: 3 },
        { title: 'Trees and Graphs', content: 'Tree and graph data structures', order: 4 },
        { title: 'Sorting and Searching Algorithms', content: 'Common sorting and searching techniques', order: 5 },
      ],
    },
    {
      title: 'UI/UX Design Principles',
      description: 'Master the fundamentals of user interface and user experience design to create intuitive and engaging applications.',
      category: 'Design',
      authorIndex: 3,
      lessons: [
        { title: 'Introduction to UI/UX', content: 'Understanding the difference between UI and UX', order: 1 },
        { title: 'User Research', content: 'Methods for researching user needs', order: 2 },
        { title: 'Wireframing and Prototyping', content: 'Creating wireframes and interactive prototypes', order: 3 },
        { title: 'Visual Design Principles', content: 'Color theory, typography, and layout', order: 4 },
        { title: 'Usability Testing', content: 'Testing designs with real users', order: 5 },
      ],
    },
    {
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning concepts, algorithms, and practical applications using Python.',
      category: 'Data Science',
      authorIndex: 4,
      lessons: [
        { title: 'Introduction to Machine Learning', content: 'Basic concepts and types of machine learning', order: 1 },
        { title: 'Data Preprocessing', content: 'Preparing data for machine learning models', order: 2 },
        { title: 'Supervised Learning', content: 'Classification and regression techniques', order: 3 },
        { title: 'Unsupervised Learning', content: 'Clustering and dimensionality reduction', order: 4 },
        { title: 'Model Evaluation', content: 'Assessing model performance', order: 5 },
      ],
    },
    {
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile applications using React Native framework and JavaScript.',
      category: 'Mobile Development',
      authorIndex: 5,
      lessons: [
        { title: 'Setting Up React Native', content: 'Installing and configuring React Native', order: 1 },
        { title: 'React Native Components', content: 'Understanding core components', order: 2 },
        { title: 'Navigation', content: 'Implementing navigation in React Native apps', order: 3 },
        { title: 'State Management', content: 'Managing state with Redux or Context API', order: 4 },
        { title: 'Deploying React Native Apps', content: 'Publishing to app stores', order: 5 },
      ],
    },
  ];

  // 创建课程及其课程章节
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
          create: courseData.lessons.map(lesson => ({
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
          })),
        },
      },
      include: {
        lessons: true,
      },
    });

    console.log(`Created course: ${course.title} (${course.lessons.length} 个章节)`);

    // 为学生注册这个课程（仅对部分课程）
    if (i % 2 === 0) {
      // 将已完成的课程ID列表存储为JSON字符串
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

      console.log(`Pupil ${student.name} Registered course: ${course.title}`);
    }
  }

  console.log('The seed data is created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 