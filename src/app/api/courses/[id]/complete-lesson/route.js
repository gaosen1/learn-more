import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Mark lesson as completed
export async function POST(request, { params }) {
  try {
    // 确保在使用params.id前先await解析params
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id, 10);
    const currentUser = getUserFromRequest(request);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }
    
    // Verify if user is logged in
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Get lesson ID from request body
    const { lessonId } = await request.json();
    const lessonIdInt = parseInt(lessonId, 10);
    
    if (!lessonId || isNaN(lessonIdInt)) {
      return NextResponse.json(
        { error: 'Valid lesson ID is required' },
        { status: 400 }
      );
    }
    
    // Verify if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonIdInt },
      include: {
        course: true
      }
    });
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    // Ensure lesson belongs to the specified course
    if (lesson.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Lesson does not belong to this course' },
        { status: 400 }
      );
    }
    
    // Find user's course enrollment record
    let userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: courseId
        }
      }
    });
    
    // If user is not enrolled in the course, create enrollment record
    if (!userCourse) {
      userCourse = await prisma.userCourse.create({
        data: {
          userId: currentUser.id,
          courseId: courseId,
          progress: 0,
          completedLessons: 0,
          completedLessonIds: '[]'
        }
      });
    }
    
    // Parse completed lesson IDs list
    const completedLessonIds = JSON.parse(userCourse.completedLessonIds || '[]');
    
    // Check if lesson is already marked as complete
    if (completedLessonIds.includes(lessonIdInt)) {
      return NextResponse.json(
        { message: 'Lesson already marked as complete' }
      );
    }
    
    // Add newly completed lesson ID
    completedLessonIds.push(lessonIdInt);
    
    // Query total number of lessons in the course
    const totalLessons = await prisma.lesson.count({
      where: { courseId: courseId }
    });
    
    // Update user course progress
    const updatedUserCourse = await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: courseId
        }
      },
      data: {
        completedLessonIds: JSON.stringify(completedLessonIds),
        completedLessons: completedLessonIds.length,
        progress: Math.round((completedLessonIds.length / totalLessons) * 100)
      }
    });
    
    return NextResponse.json({
      message: 'Lesson marked as complete',
      progress: updatedUserCourse.progress,
      completedLessons: updatedUserCourse.completedLessons
    });
    
  } catch (error) {
    console.error('Error marking lesson as complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark lesson as complete' },
      { status: 500 }
    );
  }
} 