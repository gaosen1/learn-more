import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedDevelopmentData } from '@/lib/seed-helpers';

// Make this endpoint dynamic
export const dynamic = 'force-dynamic';

/**
 * Protected API to seed the production database with essential data
 * This is intended for admin use only
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication and authorization
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: 'Unauthorized. Only educators can run database seeds.' },
        { status: 401 }
      );
    }
    
    // 2. Get parameters (optional)
    const body = await request.json().catch(() => ({}));
    const seedType = body.type || 'minimal'; // 'minimal', 'full', or 'reset'
    
    // 3. Run appropriate seed
    const prisma = new PrismaClient();
    const results: string[] = [];
    
    // Check if we're running a reset
    if (seedType === 'reset') {
      // Only allow in development or with override flag
      if (process.env.NODE_ENV === 'production' && !body.allowInProduction) {
        return NextResponse.json(
          { error: 'Reset is not allowed in production environment without override' },
          { status: 403 }
        );
      }
      
      // Clear existing data
      await prisma.userCourse.deleteMany({});
      await prisma.lesson.deleteMany({});
      await prisma.course.deleteMany({});
      await prisma.subscription.deleteMany({});
      await prisma.user.deleteMany({});
      
      results.push('Database reset completed');
    }
    
    // Get current user counts
    const userCount = await prisma.user.count();
    
    // Only seed if no users exist or reset was performed
    if (userCount > 0 && seedType !== 'reset') {
      return NextResponse.json({
        message: 'Database already has data. To force a reset, use type: "reset"',
        userCount
      });
    }
    
    // Create admin user
    const adminEmail = body.adminEmail || process.env.ADMIN_EMAIL || 'admin@learnmore.app';
    const adminPassword = body.adminPassword || process.env.ADMIN_PASSWORD || 'LearnMore@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'EDUCATOR',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
      },
    });
    
    results.push(`Created admin user: ${adminUser.email} (ID: ${adminUser.id})`);
    
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
    
    results.push(`Created sample course: ${course.title} (ID: ${course.id})`);
    
    // If full seed is requested or allowed in production, run full seed
    if (seedType === 'full' || body.allowFullSeed) {
      try {
        // Use the development data seeder
        const { users, courses } = await seedDevelopmentData(prisma, adminUser.id);
        results.push(`Full development seed completed: Created ${users.length} users and ${courses.length} courses`);
      } catch (error: any) {
        console.warn('Could not run full seed:', error);
        results.push(`Failed to run full development seed: ${error.message}`);
      }
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database seed completed successfully',
      seedType,
      results
    });
    
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: `Failed to seed database: ${error.message}` },
      { status: 500 }
    );
  }
} 