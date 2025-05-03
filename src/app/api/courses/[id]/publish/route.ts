'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { isEducator } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const currentUser = getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isEducator(currentUser)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const courseIdString = params.id;
  const courseId = parseInt(courseIdString, 10);
  const userId = currentUser.id;

  if (isNaN(courseId)) {
    console.error('Failed to parse course ID:', courseIdString);
    return NextResponse.json({ error: 'Invalid course ID format' }, { status: 400 });
  }
  if (isNaN(userId)) {
    console.error('User ID is not a number:', userId);
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.authorId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You are not the author of this course' },
        { status: 403 },
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isPublic: true },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Failed to publish course:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
} 