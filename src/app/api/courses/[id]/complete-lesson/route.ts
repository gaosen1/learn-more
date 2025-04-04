import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// 标记课程章节为已完成
export async function POST(request, { params }) {
  try {
    const courseId = params.id;
    const currentUser = getUserFromRequest(request);
    
    // 验证用户是否已登录
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // 获取请求体中的课程章节ID
    const { lessonId } = await request.json();
    
    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }
    
    // 验证课程章节是否存在
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true
      }
    });
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }
    
    // 确保章节属于指定的课程
    if (lesson.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Lesson does not belong to this course' },
        { status: 400 }
      );
    }
    
    // 查找用户的课程注册记录
    let userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: courseId
        }
      }
    });
    
    // 如果用户未注册课程，先创建注册记录
    if (!userCourse) {
      userCourse = await prisma.userCourse.create({
        data: {
          userId: currentUser.id,
          courseId: courseId,
          progress: 0,
          completedLessons: 0,
          completedLessonIds: '[]'
        }
      });
    }
    
    // 解析已完成的课程章节ID列表
    const completedLessonIds = JSON.parse(userCourse.completedLessonIds || '[]');
    
    // 检查章节是否已经标记为完成
    if (completedLessonIds.includes(lessonId)) {
      return NextResponse.json(
        { message: 'Lesson already marked as complete' }
      );
    }
    
    // 添加新完成的章节ID
    completedLessonIds.push(lessonId);
    
    // 查询课程的总章节数
    const totalLessons = await prisma.lesson.count({
      where: { courseId: courseId }
    });
    
    // 更新用户课程进度
    const updatedUserCourse = await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId: currentUser.id,
          courseId: courseId
        }
      },
      data: {
        completedLessonIds: JSON.stringify(completedLessonIds),
        completedLessons: completedLessonIds.length,
        progress: Math.round((completedLessonIds.length / totalLessons) * 100)
      }
    });
    
    return NextResponse.json({
      message: 'Lesson marked as complete',
      progress: updatedUserCourse.progress,
      completedLessons: updatedUserCourse.completedLessons
    });
    
  } catch (error) {
    console.error('Error marking lesson as complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark lesson as complete' },
      { status: 500 }
    );
  }
} 