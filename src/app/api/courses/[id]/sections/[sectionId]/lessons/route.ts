import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Make this endpoint dynamic
export const dynamic = 'force-dynamic';

// GET /api/courses/[id]/sections/[sectionId]/lessons - Get all lessons for a section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const courseId = parseInt(params.id);
    const sectionId = parseInt(params.sectionId);
    
    if (isNaN(courseId) || isNaN(sectionId)) {
      return NextResponse.json({ error: 'Invalid course or section ID' }, { status: 400 });
    }
    
    // Verify the section exists and belongs to the specified course
    const section = await prisma.section.findFirst({
      where: { 
        id: sectionId,
        courseId
      }
    });
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found or does not belong to this course' }, { status: 404 });
    }
    
    // Get lesson list
    const lessons = await prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/courses/[id]/sections/[sectionId]/lessons - Create a new lesson
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const courseId = parseInt(params.id);
    const sectionId = parseInt(params.sectionId);
    
    if (isNaN(courseId) || isNaN(sectionId)) {
      return NextResponse.json({ error: 'Invalid course or section ID' }, { status: 400 });
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
    
    // Verify the section exists and belongs to this course
    const section = await prisma.section.findFirst({
      where: { 
        id: sectionId,
        courseId
      }
    });
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found or does not belong to this course' }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate request data
    if (!body.title) {
      return NextResponse.json({ error: 'Lesson title is required' }, { status: 400 });
    }
    
    // Get the current highest lesson order in this section
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { 
        sectionId 
      },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = body.order || (maxOrderLesson ? maxOrderLesson.order + 1 : 1);
    
    // Create new lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: body.title,
        content: body.content || '',
        order: newOrder,
        sectionId,
        courseId
      }
    });
    
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 