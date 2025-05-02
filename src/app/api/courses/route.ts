import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Remove sample data
// const sampleCourses = [...];

// Get courses: public courses for guests/students, authored courses for educators, 
// or all courses for admin (adjust admin logic as needed)
export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    // const isEducatorPortalRequest = request.nextUrl.searchParams.get('context') === 'educator';
    const context = request.nextUrl.searchParams.get('context'); // Read context once

    let courses: any[] = []; // Default to empty array
    let whereClause: any = {}; // Define whereClause structure

    // Only proceed if user is an educator AND the request is for the educator portal context
    // if (currentUser && isEducator(currentUser) && isEducatorPortalRequest) {
    if (currentUser && isEducator(currentUser) && context === 'educator') {
      // --- Educator fetching their own courses ---
      console.log(`API: Fetching courses for educator ID: ${currentUser.id} (context: educator)`); // Log educator ID
      // courses = await prisma.course.findMany({
      //   where: { authorId: currentUser.id }, // Filter strictly by authorId
      //   include: {
      //     author: {
      //       select: {
      //         id: true,
      //         name: true,
      //         avatar: true
      //       }
      //     },
      //     _count: {
      //       select: { enrolledUsers: true },
      //     },
      //   },
      //   orderBy: {
      //     updatedAt: 'desc'
      //   }
      // });
      whereClause = { authorId: currentUser.id }; // Fetch all courses by this author

      courses = await prisma.course.findMany({
        where: whereClause,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { enrolledUsers: true, lessons: true } }, // Also count lessons
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Format courses for educator portal
      const formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        // description: course.description, // Keep description short if needed later
        description: course.description.length > 100 ? course.description.substring(0, 97) + '...' : course.description, // Example: Shorten description
        imageUrl: course.imageUrl,
        category: course.category,
        isPublic: course.isPublic,
        status: course.isPublic ? 'published' : 'draft', // Educator specific status
        // author: course.author.name, // Author info might be redundant here
        author: course.author.name, // Keep author name maybe?
        authorId: course.author.id,
        // authorAvatar: course.author.avatar,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        // lastUpdated: course.updatedAt.toISOString(), // Redundant with updatedAt
        lessonsCount: course._count?.lessons ?? 0,
        enrollments: course._count?.enrolledUsers ?? 0,
      }));
      return NextResponse.json(formattedCourses);

    } else {
       // --- Public course browsing (Default case) ---
       // console.log('Returning empty array - User not educator or context mismatch');
       // return NextResponse.json([]); 
       console.log(`API: Fetching public courses for general browsing`);
       whereClause = { isPublic: true }; // Fetch only public courses

       courses = await prisma.course.findMany({
         where: whereClause,
         include: {
           author: { select: { id: true, name: true, avatar: true } }, // Need author name
           _count: { select: { lessons: true } }, // Need lesson count
         },
         orderBy: { createdAt: 'desc' } // Order by creation date for public view
       });

       // Format for public course list page
       const formattedCourses = courses.map(course => ({
         id: course.id,
         title: course.title,
         description: course.description, // Full description is fine here
         imageUrl: course.imageUrl,
         category: course.category,
         // isPublic: course.isPublic, // Maybe not needed for public view?
         author: course.author.name, // Essential for public view
         // authorId: course.author.id, // Maybe not needed
         // authorAvatar: course.author.avatar, // Maybe not needed
         createdAt: course.createdAt.toISOString(),
         // updatedAt: course.updatedAt.toISOString(), // Maybe not needed
         lessonsCount: course._count?.lessons ?? 0, // Essential for public view
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