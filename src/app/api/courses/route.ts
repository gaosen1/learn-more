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
    const isEducatorPortalRequest = request.nextUrl.searchParams.get('context') === 'educator';

    let courses: any[] = []; // Default to empty array, add explicit type any[] to fix linter error

    // Only proceed if user is an educator AND the request is for the educator portal context
    if (currentUser && isEducator(currentUser) && isEducatorPortalRequest) {
      console.log(`Fetching courses for educator ID: ${currentUser.id}`); // Log educator ID
      courses = await prisma.course.findMany({
        where: { authorId: currentUser.id }, // Filter strictly by authorId
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: { enrolledUsers: true },
          },
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Format courses for educator portal
      const formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        category: course.category,
        isPublic: course.isPublic,
        status: course.isPublic ? 'published' : 'draft',
        author: course.author.name,
        authorId: course.author.id,
        authorAvatar: course.author.avatar,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        lastUpdated: course.updatedAt.toISOString(),
        enrollments: course._count?.enrolledUsers ?? 0,
      }));
      
      return NextResponse.json(formattedCourses);

    } else {
       // For all other cases (not logged in, student, or educator without correct context), return empty
       console.log('Returning empty array - User not educator or context mismatch');
       return NextResponse.json([]); 
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
            email: true,
            avatar: true
          }
        }
      }
    });
    
    // Format response data
    const formattedCourse = {
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      imageUrl: newCourse.imageUrl,
      category: newCourse.category,
      isPublic: newCourse.isPublic,
      author: newCourse.author.name,
      authorId: newCourse.author.id,
      authorAvatar: newCourse.author.avatar,
      createdAt: newCourse.createdAt.toISOString(),
      updatedAt: newCourse.updatedAt.toISOString()
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