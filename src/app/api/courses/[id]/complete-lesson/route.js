import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Mark lesson as completed
export async function POST(request, { params }) {
  try {
    // Ensure params are resolved before use
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
    
    // Verify if lesson exists and include its section
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonIdInt },
      include: {
        // course: true // Remove direct course include if not needed
        section: true // Include the section to check its courseId
      }
    });
    
    if (!lesson || !lesson.section) { // Check if lesson or section exists
      return NextResponse.json(
        { error: 'Lesson or its section not found' },
        { status: 404 }
      );
    }
    
    // Ensure lesson belongs to the specified course VIA ITS SECTION
    // if (lesson.courseId !== courseId) {
    if (lesson.section.courseId !== courseId) { // Check section's courseId
      console.log(`Lesson ${lessonIdInt} (section ${lesson.section.id}) belongs to course ${lesson.section.courseId}, but request was for course ${courseId}`);
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
      // Check if the course requires enrollment first (optional, depends on policy)
      // For now, auto-enroll like before
      console.log(`Auto-enrolling user ${currentUser.id} in course ${courseId} upon completing lesson.`);
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
    // Ensure robustness against potentially invalid JSON string
    let completedLessonIds = [];
    try {
        completedLessonIds = JSON.parse(userCourse.completedLessonIds || '[]');
        if (!Array.isArray(completedLessonIds)) { // Ensure it's an array
          console.warn(`Invalid completedLessonIds format for user ${currentUser.id}, course ${courseId}. Resetting.`);
          completedLessonIds = [];
        }
    } catch (parseError) {
        console.error(`Error parsing completedLessonIds for user ${currentUser.id}, course ${courseId}:`, parseError);
        // Decide recovery strategy: reset or return error
        completedLessonIds = []; // Resetting to empty array
    }

    // Check if lesson is already marked as complete
    if (completedLessonIds.includes(lessonIdInt)) {
      console.log(`Lesson ${lessonIdInt} already complete for user ${currentUser.id}, course ${courseId}`);
      // Return current progress instead of just a message
      return NextResponse.json({
        message: 'Lesson already marked as complete',
        progress: userCourse.progress,
        completedLessons: userCourse.completedLessons
      });
    }
    
    // Add newly completed lesson ID
    completedLessonIds.push(lessonIdInt);
    
    // Query total number of lessons in the course
    // Potential optimization: Store totalLessons count on Course model?
    const totalLessons = await prisma.lesson.count({
      where: { 
          // Count lessons belonging to sections of this course
          section: {
              courseId: courseId
          }
       }
    });
    
    const newCompletedCount = completedLessonIds.length;
    const newProgress = totalLessons > 0 ? Math.round((newCompletedCount / totalLessons) * 100) : 0;

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
        completedLessons: newCompletedCount,
        progress: newProgress
      }
    });
    
    console.log(`Lesson ${lessonIdInt} marked complete for user ${currentUser.id}, course ${courseId}. New progress: ${newProgress}%`);
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