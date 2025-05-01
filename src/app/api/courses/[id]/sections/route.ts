import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Make this endpoint dynamic
export const dynamic = 'force-dynamic';

// GET /api/courses/[id]/sections - 获取课程所有章节
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }
    
    // 验证课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // 获取课程章节和课时
    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching course sections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/courses/[id]/sections - 创建新章节
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }
    
    // 获取课程信息验证用户是否为课程作者
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    if (course.authorId !== user.id) {
      return NextResponse.json({ error: 'Only the course author can add sections' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // 验证请求数据
    if (!body.title) {
      return NextResponse.json({ error: 'Section title is required' }, { status: 400 });
    }
    
    // 获取当前最大序号，用于新章节排序
    const maxOrderSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = maxOrderSection ? maxOrderSection.order + 1 : 1;
    
    // 创建新章节
    const newSection = await prisma.section.create({
      data: {
        title: body.title,
        order: body.order || newOrder,
        courseId
      }
    });
    
    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 