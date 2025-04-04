import { NextRequest, NextResponse } from 'next/server';
import { courses } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = courses.find(c => c.id === params.id);
  
  if (!course) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(course);
} 