import { PrismaClient, User, UserRole, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
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
    // --- Restore database clearing ---
    console.log('Clearing existing data...');
    // Clear in reverse order of dependency to avoid constraint errors
    await prisma.userCourse.deleteMany({});
    await prisma.solution.deleteMany({}); // Assuming Solution depends on Exercise/User
    await prisma.exercise.deleteMany({}); // Assuming Exercise depends on User
    await prisma.lesson.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('All existing data cleared.');
    // --- End database clearing ---

    console.log('Creating sample data...');
    
    // Create sample users (educators)
    const educators = [
      { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'John Doe', email: 'john.doe@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Alex Johnson', email: 'alex.johnson@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Emma Wilson', email: 'emma.wilson@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Michael Brown', email: 'michael.brown@example.com', role: 'EDUCATOR' as UserRole },
      { name: 'Sarah Parker', email: 'sarah.parker@example.com', role: 'EDUCATOR' as UserRole }, // Added Sarah Parker
    ];

    // Use the same password for all users to simplify the example
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create users
    const createdEducators: User[] = [];
    let sarahParkerId: number | null = null;
    for (const educator of educators) {
      const user = await prisma.user.create({
        data: {
          email: educator.email,
          name: educator.name,
          password: hashedPassword,
          role: 'EDUCATOR',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(educator.name)}&background=random`, // Use encodeURIComponent
        },
      });
      createdEducators.push(user);
      if (user.email === 'sarah.parker@example.com') {
        sarahParkerId = user.id;
      }
      console.log(`Created educator: ${user.name} (ID: ${user.id})`);
    }
    
    if (!sarahParkerId) {
      console.error('Could not find or create Sarah Parker user!');
      return; // Exit if Sarah Parker wasn't created
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

    // --- Create Admin User --- 
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Platform Admin',
        password: hashedPassword, // Use the same hashed password or a new one
        role: 'ADMIN' as UserRole, // <-- Use type assertion temporarily
        avatar: `https://ui-avatars.com/api/?name=Admin&background=grey`, // Custom avatar
      },
    });
    console.log(`Created admin user: ${adminUser.name} (ID: ${adminUser.id})`);
    // --- End Admin User Creation ---

    // Create sample subscription data
    console.log('Creating sample subscriptions...');
    
    // Subscription plan data
    const subscriptionPlans = [
      {
        plan: 'BASIC',
        price: 9.99,
        billingCycle: 'monthly',
        features: JSON.stringify({
          coursesLimit: 5,
          downloadContent: false,
          supportLevel: 'basic',
          certificatesEnabled: false
        })
      },
      {
        plan: 'STANDARD',
        price: 19.99,
        billingCycle: 'monthly',
        features: JSON.stringify({
          coursesLimit: 15,
          downloadContent: true,
          supportLevel: 'standard',
          certificatesEnabled: true
        })
      },
      {
        plan: 'PREMIUM',
        price: 29.99,
        billingCycle: 'monthly',
        features: JSON.stringify({
          coursesLimit: -1, // unlimited
          downloadContent: true,
          supportLevel: 'priority',
          certificatesEnabled: true,
          mentorSupport: true
        })
      },
      {
        plan: 'ENTERPRISE',
        price: 299.99,
        billingCycle: 'yearly',
        features: JSON.stringify({
          coursesLimit: -1, // unlimited
          downloadContent: true,
          supportLevel: 'dedicated',
          certificatesEnabled: true,
          mentorSupport: true,
          customBranding: true,
          teamManagement: true
        })
      }
    ];
    
    // Create subscriptions for users
    // Student gets a BASIC subscription
    const studentSubscription = await prisma.subscription.create({
      data: {
        userId: student.id,
        plan: 'BASIC' as SubscriptionPlan,
        status: 'ACTIVE' as SubscriptionStatus,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Expires in one month
        price: subscriptionPlans[0].price,
        billingCycle: subscriptionPlans[0].billingCycle,
        features: subscriptionPlans[0].features,
      }
    });
    console.log(`Created BASIC subscription for student (ID: ${studentSubscription.id})`);
    
    // Create different subscriptions for some educators
    const educatorSubscriptions = [
      { 
        userId: createdEducators[0].id, 
        plan: 'STANDARD' as SubscriptionPlan,
        status: 'ACTIVE' as SubscriptionStatus,
        planIndex: 1 
      },
      { 
        userId: createdEducators[1].id, 
        plan: 'PREMIUM' as SubscriptionPlan,
        status: 'ACTIVE' as SubscriptionStatus,
        planIndex: 2 
      },
      { 
        userId: createdEducators[2].id, 
        plan: 'ENTERPRISE' as SubscriptionPlan,
        status: 'ACTIVE' as SubscriptionStatus,
        planIndex: 3 
      },
      { 
        userId: createdEducators[3].id, 
        plan: 'BASIC' as SubscriptionPlan, 
        status: 'EXPIRED' as SubscriptionStatus,
        planIndex: 0 
      },
      { 
        userId: createdEducators[4].id, 
        plan: 'STANDARD' as SubscriptionPlan,
        status: 'CANCELLED' as SubscriptionStatus,
        planIndex: 1 
      }
    ];
    
    for (const subData of educatorSubscriptions) {
      const planDetails = subscriptionPlans[subData.planIndex];
      
      // Calculate end date based on status
      let endDate = new Date();
      if (subData.status === 'ACTIVE') {
        // For active subscriptions, set future expiry date
        if (planDetails.billingCycle === 'monthly') {
          endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
        } else if (planDetails.billingCycle === 'quarterly') {
          endDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
        } else {
          endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        }
      } else {
        // For expired/cancelled subscriptions, set past date
        endDate = new Date(new Date().setDate(new Date().getDate() - 10));
      }
      
      const subscription = await prisma.subscription.create({
        data: {
          userId: subData.userId,
          plan: subData.plan,
          status: subData.status,
          startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Started a month ago
          endDate: endDate,
          price: planDetails.price,
          billingCycle: planDetails.billingCycle,
          features: planDetails.features,
          isArchived: subData.status === 'CANCELLED' // Archive cancelled subscriptions
        }
      });
      
      console.log(`Created ${subData.plan} subscription for user ID ${subData.userId} (ID: ${subscription.id})`);
    }

    // Sample course data
    const coursesData = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
        imageUrl: sampleImageUrls[0],
        category: 'web development',
        isPublic: true,
        authorId: createdEducators[0].id,
        lessons: [
          { title: 'HTML Basics', content: 'Introduction to HTML syntax and document structure.', order: 1 },
          { title: 'CSS Fundamentals', content: 'Basic CSS styling techniques and selectors.', order: 2 },
          { title: 'JavaScript Essentials', content: 'Introduction to JavaScript and DOM manipulation.', order: 3 },
          { title: 'Building Your First Website', content: 'Putting it all together to create a simple website.', order: 4 }
        ]
      },
      {
        title: 'Python Programming for Beginners',
        description: 'A comprehensive introduction to Python for absolute beginners.',
        imageUrl: sampleImageUrls[1],
        category: 'programming',
        isPublic: true,
        authorId: createdEducators[1].id,
        lessons: [
          { title: 'Python Setup', content: 'Installing Python and setting up your development environment.', order: 1 },
          { title: 'Variables and Data Types', content: 'Understanding basic data types and variable assignments.', order: 2 },
          { title: 'Control Flow', content: 'Conditional statements and loops in Python.', order: 3 },
          { title: 'Functions', content: 'Creating and using functions in Python.', order: 4 },
          { title: 'Working with Lists', content: 'Manipulating and using lists effectively.', order: 5 }
        ]
      },
      {
        title: 'Data Science Fundamentals',
        description: 'Introduction to data science concepts, tools, and methodologies.',
        imageUrl: sampleImageUrls[2],
        category: 'data science',
        isPublic: true,
        authorId: createdEducators[2].id,
        lessons: [
          { title: 'Introduction to Data Science', content: 'Overview of data science field and applications.', order: 1 },
          { title: 'Statistics Basics', content: 'Fundamental statistical concepts for data analysis.', order: 2 },
          { title: 'Data Cleaning', content: 'Techniques for preparing and cleaning datasets.', order: 3 },
          { title: 'Data Visualization', content: 'Creating effective visualizations with Python libraries.', order: 4 },
          { title: 'Introduction to Machine Learning', content: 'Basic machine learning algorithms and concepts.', order: 5 }
        ]
      },
      {
        title: 'Mobile App Development with React Native',
        description: 'Build cross-platform mobile applications using React Native.',
        imageUrl: sampleImageUrls[3],
        category: 'mobile development',
        isPublic: true,
        authorId: createdEducators[3].id,
        lessons: [
          { title: 'React Native Setup', content: 'Setting up your development environment for React Native.', order: 1 },
          { title: 'Components and Props', content: 'Understanding React Native components and props.', order: 2 },
          { title: 'State Management', content: 'Managing state in React Native applications.', order: 3 },
          { title: 'Navigation', content: 'Implementing navigation in mobile applications.', order: 4 },
          { title: 'Working with APIs', content: 'Fetching and using data from APIs in React Native.', order: 5 },
          { title: 'Publishing Your App', content: 'Steps to publish your app to Apple App Store and Google Play.', order: 6 }
        ]
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Learn essential UI/UX design principles to create better user experiences.',
        imageUrl: sampleImageUrls[4],
        category: 'design',
        isPublic: true,
        authorId: createdEducators[4].id,
        lessons: [
          { title: 'Introduction to UI/UX', content: 'Understanding the difference between UI and UX.', order: 1 },
          { title: 'User Research', content: 'Methods for conducting effective user research.', order: 2 },
          { title: 'Wireframing and Prototyping', content: 'Creating wireframes and interactive prototypes.', order: 3 },
          { title: 'Visual Design Principles', content: 'Core visual design principles for digital products.', order: 4 },
          { title: 'Usability Testing', content: 'How to conduct usability tests and interpret results.', order: 5 }
        ]
      },
      {
        title: 'Full Stack Web Development with Node.js',
        description: 'Learn to build complete web applications with Node.js, Express, and MongoDB.',
        imageUrl: sampleImageUrls[5],
        category: 'web development',
        isPublic: true,
        authorId: createdEducators[5].id,
        lessons: [
          { title: 'Node.js Fundamentals', content: 'Introduction to Node.js and its core concepts.', order: 1 },
          { title: 'Express.js Framework', content: 'Building web applications with Express.js.', order: 2 },
          { title: 'MongoDB Integration', content: 'Working with MongoDB for data storage.', order: 3 },
          { title: 'RESTful API Development', content: 'Designing and implementing RESTful APIs.', order: 4 },
          { title: 'Authentication and Authorization', content: 'Implementing user authentication and authorization.', order: 5 },
          { title: 'Deployment and DevOps', content: 'Deploying your application to production.', order: 6 }
        ]
      }
    ];

    // Create courses with lessons
    console.log('Creating sample courses and lessons...');
    for (const courseData of coursesData) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          imageUrl: courseData.imageUrl,
          category: courseData.category,
          isPublic: courseData.isPublic,
          authorId: courseData.authorId,
        },
      });
      
      console.log(`Created course: ${course.title} (ID: ${course.id})`);
      
      // Create a default section for the course
      const defaultSection = await prisma.section.create({
          data: {
              title: 'Section 1', // Default section title
              order: 1,
              courseId: course.id,
          }
      });
      console.log(`  Created default section for course ${course.title} (ID: ${defaultSection.id})`);
      
      // Create lessons for this course, assigning them to the default section
      for (const lessonData of courseData.lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            title: lessonData.title,
            content: lessonData.content,
            order: lessonData.order,
            sectionId: defaultSection.id, // Assign to the created section
          },
        });
        console.log(`  Created lesson: ${lesson.title} (ID: ${lesson.id})`);
      }
    }
    
    // --- Create specific courses for Sarah Parker --- 
    console.log(`Creating specific courses for Sarah Parker (ID: ${sarahParkerId})...`);

    const sarahCoursesData = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
        imageUrl: sampleImageUrls[0], // Use a sample image
        category: 'web development', // Assign a category
        isPublic: true, // Status: published
        lessons: [ // Add sample lessons
          { title: 'HTML Basics', content: '...', order: 1 },
          { title: 'CSS Fundamentals', content: '...', order: 2 },
          { title: 'JavaScript Essentials', content: '...', order: 3 }
        ]
      },
      {
        title: 'Python Programming for Beginners',
        description: 'A comprehensive introduction to Python for absolute beginners.',
        imageUrl: sampleImageUrls[1],
        category: 'programming',
        isPublic: true, // Status: published
        lessons: [
          { title: 'Python Setup', content: '...', order: 1 },
          { title: 'Variables and Data Types', content: '...', order: 2 },
          { title: 'Control Flow', content: '...', order: 3 }
        ]
      },
      {
        title: 'Advanced React Patterns',
        description: 'Master advanced React patterns and techniques for building complex applications.',
        imageUrl: sampleImageUrls[3],
        category: 'web development',
        isPublic: false, // Status: draft
        lessons: [
          { title: 'Higher-Order Components', content: '...', order: 1 },
          { title: 'Render Props', content: '...', order: 2 },
          { title: 'React Hooks In-depth', content: '...', order: 3 }
        ]
      }
    ];

    for (const courseData of sarahCoursesData) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          imageUrl: courseData.imageUrl,
          category: courseData.category,
          isPublic: courseData.isPublic,
          authorId: sarahParkerId, // Assign Sarah as author
          sections: { // Create default section and lessons
            create: {
              title: 'Section Content',
              order: 1,
              lessons: {
                create: courseData.lessons.map(lesson => ({
                  title: lesson.title,
                  content: lesson.content || `Content for ${lesson.title}`,
                  order: lesson.order
                }))
              }
            }
          }
        },
      });
      console.log(`  Created course for Sarah: ${course.title} (ID: ${course.id})`);
    }
    // --- End Sarah Parker courses --- 

    // Enroll student in some courses
    console.log('Enrolling student in courses...');
    const courseIds = await prisma.course.findMany({
      take: 3,
      select: { id: true },
    });
    
    for (const { id: courseId } of courseIds) {
      const userCourse = await prisma.userCourse.create({
        data: {
          userId: student.id,
          courseId,
          progress: Math.floor(Math.random() * 100), // Random progress
          completedLessons: Math.floor(Math.random() * 3), // Random completed lessons
          completedLessonIds: JSON.stringify([]), // No completed lessons initially
        },
      });
      
      console.log(`Enrolled student in course ID ${courseId} (Enrollment ID: ${userCourse.id})`);
    }
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 