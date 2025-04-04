import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// 获取单个课程详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getUserFromRequest(request);
    const courseId = params.id;
    
    // 获取课程详情，包括作者和课程章节
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
        lessons: {
          orderBy: {
            order: 'asc'
          }
        },
        enrolledUsers: true
      }
    });
    
    // 课程不存在
    if (!course) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }
    
    // 检查课程访问权限
    const isAuthor = currentUser && course.authorId === currentUser.id;
    if (!course.isPublic && !isAuthor) {
      return NextResponse.json(
        { error: '无权访问此课程' },
        { status: 403 }
      );
    }
    
    // 查找当前用户的注册信息
    const userEnrollment = currentUser
      ? course.enrolledUsers.find(enrollment => enrollment.userId === currentUser.id)
      : null;
    
    // 格式化响应数据
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
      lessons: course.lessons.map(lesson => ({
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
      isAuthor
    };
    
    return NextResponse.json(formattedCourse);
    
  } catch (error) {
    console.error('获取课程详情错误:', error);
    return NextResponse.json(
      { error: '获取课程详情时发生错误' },
      { status: 500 }
    );
  }
}

// 更新课程信息（仅教育者可修改自己的课程）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getUserFromRequest(request);
    const courseId = params.id;
    
    // 验证用户是否已登录且为教育者
    if (!currentUser) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      );
    }
    
    // 验证用户角色是否为教育者
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: '只有教育者可以编辑课程' },
        { status: 403 }
      );
    }
    
    // 查找课程
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });
    
    // 课程不存在
    if (!existingCourse) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }
    
    // 验证是否为课程作者
    if (existingCourse.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: '只有课程作者可以编辑该课程' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, imageUrl, category, isPublic, lessons } = body;
    
    // 更新课程基本信息
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
    
    // 如果提供了课程章节数据，更新课程章节
    if (lessons && lessons.length > 0) {
      // 获取现有课程章节ID列表
      const existingLessonIds = existingCourse.lessons.map(lesson => lesson.id);
      
      // 找出需要删除的课程章节
      const updatedLessonIds = lessons.filter((l: any) => l.id).map((l: any) => l.id);
      const lessonsToDelete = existingLessonIds.filter(id => !updatedLessonIds.includes(id));
      
      // 删除不再需要的课程章节
      if (lessonsToDelete.length > 0) {
        await prisma.lesson.deleteMany({
          where: {
            id: { in: lessonsToDelete }
          }
        });
      }
      
      // 更新或创建课程章节
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        
        if (lesson.id) {
          // 更新现有课程章节
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: {
              title: lesson.title,
              content: lesson.content || '',
              order: i
            }
          });
        } else {
          // 创建新课程章节
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
    
    // 获取更新后的完整课程信息
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
        { error: '获取更新后课程信息失败' },
        { status: 500 }
      );
    }
    
    // 格式化响应数据
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
    console.error('更新课程错误:', error);
    return NextResponse.json(
      { error: '更新课程时发生错误' },
      { status: 500 }
    );
  }
}

// 删除课程（仅教育者可删除自己的课程）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getUserFromRequest(request);
    const courseId = params.id;
    
    // 验证用户是否已登录且为教育者
    if (!currentUser) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      );
    }
    
    // 验证用户角色是否为教育者
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: '只有教育者可以删除课程' },
        { status: 403 }
      );
    }
    
    // 查找课程
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    // 课程不存在
    if (!existingCourse) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }
    
    // 验证是否为课程作者
    if (existingCourse.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: '只有课程作者可以删除该课程' },
        { status: 403 }
      );
    }
    
    // 删除课程（级联删除相关章节和注册记录）
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    return NextResponse.json(
      { message: '课程已成功删除' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('删除课程错误:', error);
    return NextResponse.json(
      { error: '删除课程时发生错误' },
      { status: 500 }
    );
  }
} 