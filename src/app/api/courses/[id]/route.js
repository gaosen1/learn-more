import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Get a single course detail
export async function GET(request, { params }) {
  try {
    // 确保在使用params.id前先await解析params
    const resolvedParams = await params;
    const currentUser = getUserFromRequest(request);
    const courseId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }
    
    // Get course details, including author and course chapters
    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
        },
        enrolledUsers: true
      }
    });
    
    // Course does not exist
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check course access permission
    const isAuthor = currentUser && course.authorId === currentUser.id;
    if (!course.isPublic && !isAuthor) {
      return NextResponse.json(
        { error: 'No permission to access this course' },
        { status: 403 }
      );
    }
    
    // Find current user's enrollment information
    const userEnrollment = currentUser
      ? course.enrolledUsers.find(enrollment => enrollment.userId === currentUser.id)
      : null;
    
    // Format response data
    const formattedCourse = {
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
        content: lesson.content,
        completed: userEnrollment 
          ? JSON.parse(userEnrollment.completedLessonIds || '[]').includes(lesson.id)
          : false
      })),
      progress: userEnrollment ? userEnrollment.progress : 0,
      completedLessons: userEnrollment ? userEnrollment.completedLessons : 0,
      isEnrolled: !!userEnrollment,
      isAuthor
    };
    
    return NextResponse.json(formattedCourse);
    
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching course details' },
      { status: 500 }
    );
  }
}

// Update course information (only educators can modify their own courses)
export async function PUT(request, { params }) {
  try {
    // 确保在使用params.id前先await解析params
    const resolvedParams = await params;
    const currentUser = getUserFromRequest(request);
    const courseId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }
    
    // Verify if the user is logged in and is an educator
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Verify if the user's role is educator
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: 'Only educators can edit courses' },
        { status: 403 }
      );
    }
    
    // Find the course
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });
    
    // Course does not exist
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Verify if the user is the course author
    if (existingCourse.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Only the course author can edit this course' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, imageUrl, category, isPublic, lessons } = body;
    
    // Update course basic information
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || existingCourse.title,
        description: description || existingCourse.description,
        imageUrl: imageUrl || existingCourse.imageUrl,
        category: category || existingCourse.category,
        isPublic: isPublic !== undefined ? isPublic : existingCourse.isPublic
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    // If lesson data is provided, update course lessons
    if (lessons && lessons.length > 0) {
      // Get the list of existing lesson IDs
      const existingLessonIds = existingCourse.lessons.map(lesson => lesson.id);
      
      // Find the lessons that need to be deleted
      const updatedLessonIds = lessons.filter(l => l.id).map(l => l.id);
      const lessonsToDelete = existingLessonIds.filter(id => !updatedLessonIds.includes(id));
      
      // Delete lessons that are no longer needed
      if (lessonsToDelete.length > 0) {
        await prisma.lesson.deleteMany({
          where: {
            id: { in: lessonsToDelete }
          }
        });
      }
      
      // Update or create course lessons
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        
        if (lesson.id) {
          // Update existing lesson
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: {
              title: lesson.title,
              content: lesson.content || '',
              order: i
            }
          });
        } else {
          // Create new lesson
          await prisma.lesson.create({
            data: {
              title: lesson.title,
              content: lesson.content || '',
              order: i,
              courseId: courseId
            }
          });
        }
      }
    }
    
    // Get updated complete course information
    const finalCourse = await prisma.course.findUnique({
      where: { id: courseId },
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
        },
        enrolledUsers: {
          where: { userId: currentUser.id }
        }
      }
    });
    
    if (!finalCourse) {
      return NextResponse.json(
        { error: 'Failed to get updated course information' },
        { status: 500 }
      );
    }
    
    // Format response data
    const userEnrollment = finalCourse.enrolledUsers[0];
    const formattedCourse = {
      id: finalCourse.id,
      title: finalCourse.title,
      description: finalCourse.description,
      imageUrl: finalCourse.imageUrl,
      category: finalCourse.category,
      isPublic: finalCourse.isPublic,
      author: finalCourse.author.name,
      authorId: finalCourse.author.id,
      authorAvatar: finalCourse.author.avatar,
      createdAt: finalCourse.createdAt.toISOString(),
      updatedAt: finalCourse.updatedAt.toISOString(),
      lessons: finalCourse.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        completed: userEnrollment 
          ? JSON.parse(userEnrollment.completedLessonIds || '[]').includes(lesson.id)
          : false
      })),
      progress: userEnrollment ? userEnrollment.progress : 0,
      completedLessons: userEnrollment ? userEnrollment.completedLessons : 0,
      isEnrolled: !!userEnrollment,
      isAuthor: true
    };
    
    return NextResponse.json(formattedCourse);
    
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the course' },
      { status: 500 }
    );
  }
}

// Delete course (only educators can delete their own courses)
export async function DELETE(request, { params }) {
  try {
    // 确保在使用params.id前先await解析params
    const resolvedParams = await params;
    const currentUser = getUserFromRequest(request);
    const courseId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }
    
    // Verify if the user is logged in and is an educator
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Verify if the user's role is educator
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: 'Only educators can delete courses' },
        { status: 403 }
      );
    }
    
    // Find the course
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    // Course does not exist
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Verify if the user is the course author
    if (existingCourse.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Only the course author can delete this course' },
        { status: 403 }
      );
    }
    
    // Delete the course (cascade delete related lessons and enrollment records)
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    return NextResponse.json(
      { message: 'Course has been successfully deleted' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the course' },
      { status: 500 }
    );
  }
} 