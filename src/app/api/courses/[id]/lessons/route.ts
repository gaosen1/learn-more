import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Define a type alias for the context parameter
type ApiRouteContext<T extends Record<string, string>> = {
  params: T;
}

// Make this endpoint dynamic
export const dynamic = 'force-dynamic';

// --- Uncomment and update GET function --- 
// GET /api/courses/[id]/lessons - Get all lessons for a course
export async function GET(
  request: NextRequest, // Use NextRequest
  context: ApiRouteContext<{ id: string }> // Use type alias
) {
  try {
    const courseId = parseInt(context.params.id); // Use context.params.id
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Get all lessons for this course, ordered by section then lesson order
    const lessons = await prisma.lesson.findMany({
      where: { 
        courseId 
      },
      include: {
        section: true // Include section for ordering
      },
      orderBy: [
        { section: { order: 'asc' } },
        { order: 'asc' }
      ]
    });
    
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// --- End GET function ---

// --- Uncomment and update POST function --- 
// POST /api/courses/[id]/lessons - Create a new lesson
export async function POST(
  request: NextRequest,
  context: ApiRouteContext<{ id: string }> // Use type alias
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const courseId = parseInt(context.params.id); // Use context.params.id
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }
    
    // Check if the course exists and the user is the author
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    if (course.authorId !== user.id) {
      return NextResponse.json({ error: 'Only the course author can add lessons' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate request data
    if (!body.title || !body.sectionId) {
      return NextResponse.json({ error: 'Lesson title and sectionId are required' }, { status: 400 });
    }
    
    const sectionId = parseInt(body.sectionId);
    
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: 'Invalid section ID' }, { status: 400 });
    }
    
    // Verify the section exists and belongs to this course
    const section = await prisma.section.findFirst({
      where: { 
        id: sectionId,
        courseId // Use courseId derived from context.params.id
      }
    });
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found or does not belong to this course' }, { status: 404 });
    }
    
    // Get the current highest lesson order in this section
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { 
        sectionId 
      },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = body.order || (maxOrderLesson ? maxOrderLesson.order + 1 : 1);
    
    // Create the new lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: body.title,
        content: body.content || '',
        order: newOrder,
        sectionId,
        courseId // Use courseId derived from context.params.id
      }
    });
    
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
// --- End POST function --- 