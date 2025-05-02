import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = parseInt(params.id, 10);
    const currentUser = getUserFromRequest(request);

    // 1. Validate Input & Authentication
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID format' }, { status: 400 });
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized, please login first' }, { status: 401 });
    }

    // 2. Check if Course Exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 3. Check if Already Enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      // Already enrolled, return success (or a specific status code like 200 OK or even 204 No Content)
      // Returning the existing enrollment might be useful for the client
      console.log(`User ${currentUser.id} already enrolled in course ${courseId}`);
      return NextResponse.json({ message: 'Already enrolled', enrollment: existingEnrollment }, { status: 200 });
    }

    // 4. Create New Enrollment Record
    console.log(`Enrolling user ${currentUser.id} in course ${courseId}`);
    const newEnrollment = await prisma.userCourse.create({
      data: {
        userId: currentUser.id,
        courseId: courseId,
        progress: 0,             // Default progress
        completedLessons: 0,     // Default completed count
        completedLessonIds: '[]', // Default empty JSON array string
        // enrolledAt is set by @default(now())
      },
    });

    // 5. Return Success Response
    return NextResponse.json(
      { message: 'Successfully enrolled', enrollment: newEnrollment },
      { status: 201 } // 201 Created status
    );

  } catch (error) {
    console.error('Error enrolling user in course:', error);
    return NextResponse.json(
      { error: 'An error occurred while enrolling in the course' },
      { status: 500 }
    );
  }
} 