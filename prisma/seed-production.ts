import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Production seed file - creates minimal required data for production
 * Only creates essential data, not test data
 */
async function main() {
  try {
    console.log('Starting production seed...');
    
    // Check if we already have any users
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('Database already has users, skipping seed');
      return;
    }
    
    // Create an admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'LearnMore@123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@learnmore.app',
        name: 'Admin User',
        password: hashedPassword,
        role: 'EDUCATOR' as UserRole,
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
      },
    });
    
    console.log(`Created admin user: ${adminUser.name} (ID: ${adminUser.id})`);
    
    // Create a sample course
    const course = await prisma.course.create({
      data: {
        title: 'Getting Started with LearnMore',
        description: 'Learn how to use the LearnMore platform to enhance your learning experience.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        category: 'platform',
        isPublic: true,
        authorId: adminUser.id,
        lessons: {
          create: [
            {
              title: 'Platform Overview',
              content: 'Introduction to the LearnMore platform and its features.',
              order: 1
            },
            {
              title: 'Finding the Right Courses',
              content: 'How to search and enroll in courses that match your interests.',
              order: 2
            },
            {
              title: 'Tracking Your Progress',
              content: 'Using the dashboard to track your learning progress.',
              order: 3
            }
          ]
        }
      }
    });
    
    console.log(`Created sample course: ${course.title} (ID: ${course.id})`);
    
    console.log('Production seed completed!');
  } catch (error) {
    console.error('Error in production seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 