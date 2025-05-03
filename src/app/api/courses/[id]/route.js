import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Get a single course detail
export async function GET(request, { params }) {
  try {
    // Ensure params are resolved before use
    const resolvedParams = await params;
    const currentUser = getUserFromRequest(request);
    const courseId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }
    
    // Get course details, including author, sections with lessons, and enrollments
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
        // Include sections, and within sections, include lessons
        sections: {
          orderBy: { order: 'asc' }, // Order sections
          include: {
            lessons: {
              orderBy: { order: 'asc' } // Order lessons within each section
            }
          }
        },
        // Include enrollments to determine progress and completion status
        enrolledUsers: {
          where: { userId: currentUser?.id ?? -1 } // Fetch only current user's enrollment or none if guest
        }
      }
    });
    
    // Course does not exist
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // --- Access Control (Moved after fetching course) --- 
    const isAuthor = currentUser && course.authorId === currentUser.id;
    // Allow access if course is public, or if user is the author
    if (!course.isPublic && !isAuthor) {
       // Check if the user is enrolled (even if not public/author)
       // Need to fetch enrollment status separately if needed for private courses
       // For now, restrict access strictly
       // TODO: Refine access control for enrolled users of private courses if needed
       const userEnrollmentCheck = currentUser ? await prisma.userCourse.findUnique({
         where: { userId_courseId: { userId: currentUser.id, courseId: courseId } }
       }) : null;
       
       if (!userEnrollmentCheck) {
         return NextResponse.json(
           { error: 'Access denied. This course is private.' }, 
           { status: 403 }
         );
       }
       // If enrolled, allow access (isEnrolled flag will be set later)
    }
    // --- End Access Control ---
    
    // Find current user's enrollment information from the fetched data
    const userEnrollment = course.enrolledUsers.length > 0 ? course.enrolledUsers[0] : null;
    
    // --- Format response data --- 
    // Flatten lessons from sections into a single array
    const allLessons = course.sections.flatMap((section, sectionIndex) => 
        section.lessons.map((lesson, lessonIndex) => ({
            id: lesson.id,
            title: lesson.title,
            content: lesson.content, // Consider omitting content in list view if large
            order: lesson.order, // Keep order if needed by frontend
            sectionId: lesson.sectionId, // Keep sectionId if needed
            // Calculate completion status based on userEnrollment
            completed: userEnrollment 
              ? JSON.parse(userEnrollment.completedLessonIds || '[]').includes(lesson.id)
              : false,
            // Add flatIndex if needed for easier frontend handling with currentLessonIndex
            // flatIndex: course.sections.slice(0, sectionIndex).reduce((sum, s) => sum + s.lessons.length, 0) + lessonIndex 
        }))
    );

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
      // Use the flattened and formatted lessons array (keep for compatibility?)
      lessons: allLessons, 
      // Add the nested sections structure
      sections: course.sections.map(section => ({
          id: section.id,
          title: section.title,
          order: section.order,
          // Map lessons within sections, ensuring completion status is included
          lessons: section.lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              // Avoid sending full content in the nested structure unless needed
              // content: lesson.content, 
              order: lesson.order,
              completed: userEnrollment
                ? JSON.parse(userEnrollment.completedLessonIds || '[]').includes(lesson.id)
                : false
          }))
      })),
      // Use progress/completion data from the fetched enrollment record
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