import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Remove sample data
// const sampleCourses = [...];

// Get courses: 
// - context=educator: authored courses for educators
// - context=my-courses: enrolled courses for the current user
// - default: public courses for guests/students
export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    const context = request.nextUrl.searchParams.get('context');

    let courses: any[] = [];
    let whereClause: any = {};

    if (currentUser && isEducator(currentUser) && context === 'educator') {
      // --- Educator fetching their own courses ---
      console.log(`API: Fetching courses for educator ID: ${currentUser.id} (context: educator)`);
      whereClause = { authorId: currentUser.id };

      courses = await prisma.course.findMany({
        where: whereClause,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { enrolledUsers: true, lessons: true } },
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Format for educator dashboard
      const formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description.length > 100 ? course.description.substring(0, 97) + '...' : course.description,
        imageUrl: course.imageUrl,
        category: course.category,
        isPublic: course.isPublic,
        status: course.isPublic ? 'published' : 'draft',
        author: course.author.name,
        authorId: course.author.id,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        lessonsCount: course._count?.lessons ?? 0,
        enrollments: course._count?.enrolledUsers ?? 0,
      }));
      return NextResponse.json(formattedCourses);

    } else if (currentUser && context === 'my-courses') {
      // --- Student/User fetching their enrolled courses ("My Courses") ---
      console.log(`API: Fetching enrolled courses for user ID: ${currentUser.id} (context: my-courses)`);
      
      // Find all enrollments for the current user
      const enrollments = await prisma.userCourse.findMany({
        where: { userId: currentUser.id },
        include: {
          course: { // Include the actual course data
            include: {
              author: { select: { id: true, name: true, avatar: true } },
              _count: { select: { lessons: true } } // Need total lessons count
            }
          }
        },
        orderBy: { // Order by enrollment date or course update date?
          enrolledAt: 'desc' 
        }
      });
      
      // Format the enrolled courses data, including progress
      const formattedCourses = enrollments.map(enrollment => ({
         id: enrollment.course.id,
         title: enrollment.course.title,
         description: enrollment.course.description, // Maybe shorten this too?
         imageUrl: enrollment.course.imageUrl,
         category: enrollment.course.category,
         isPublic: enrollment.course.isPublic, // Might be useful to know
         author: enrollment.course.author.name,
         createdAt: enrollment.course.createdAt.toISOString(),
         lessonsCount: enrollment.course._count?.lessons ?? 0,
         // Add progress info from the enrollment record
         progress: enrollment.progress,
         completedLessons: enrollment.completedLessons,
         enrolledAt: enrollment.enrolledAt.toISOString()
       }));
      
      return NextResponse.json(formattedCourses);
      
    } else {
       // --- Public course browsing (Default case) ---
       console.log(`API: Fetching public courses for general browsing (User: ${currentUser?.id ?? 'Guest'})`);
       whereClause = { isPublic: true }; // Fetch only public courses

       courses = await prisma.course.findMany({
         where: whereClause,
         include: {
           author: { select: { id: true, name: true, avatar: true } },
           _count: { select: { lessons: true } },
         },
         orderBy: { createdAt: 'desc' } 
       });

       // Format for public course list page
       const formattedCourses = courses.map(course => ({
         id: course.id,
         title: course.title,
         description: course.description,
         imageUrl: course.imageUrl,
         category: course.category,
         author: course.author.name,
         createdAt: course.createdAt.toISOString(),
         lessonsCount: course._count?.lessons ?? 0,
       }));
       return NextResponse.json(formattedCourses);
    }
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching courses' },
      { status: 500 }
    );
  }
}

// Create new course (educator role only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    // Verify if user is logged in and is an educator
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Verify if user's role is educator
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: 'Only educators can create courses' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, imageUrl, category, isPublic = false } = body;
    
    // Validate required fields
    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Title, description, image and category are required' },
        { status: 400 }
      );
    }
    
    // Create new course
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        isPublic,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            // email: true, // Keep email if needed internally, but don't return usually
            avatar: true
          }
        }
      }
    });
    
    // Format response data carefully (don't expose unnecessary author info)
    const formattedCourse = {
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      imageUrl: newCourse.imageUrl,
      category: newCourse.category,
      isPublic: newCourse.isPublic,
      author: newCourse.author.name, // Return author name
      authorId: newCourse.author.id, // Return author ID might be useful
      authorAvatar: newCourse.author.avatar, // Return avatar
      createdAt: newCourse.createdAt.toISOString(),
      updatedAt: newCourse.updatedAt.toISOString()
      // lessonsCount: 0 // New course has 0 lessons initially
    };
    
    return NextResponse.json(formattedCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the course' },
      { status: 500 }
    );
  }
} 