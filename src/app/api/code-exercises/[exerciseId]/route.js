import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

// 获取单个练习详情
export async function GET(req, { params }) {
  try {
    const { exerciseId } = params;

    if (!exerciseId) {
      return NextResponse.json({ error: '练习ID是必需的' }, { status: 400 });
    }

    const exercise = await db.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: '练习未找到' }, { status: 404 });
    }

    // 转换测试用例回JSON格式
    const exerciseWithParsedTestCases = {
      ...exercise,
      testCases: JSON.parse(exercise.testCases || '[]'),
    };

    return NextResponse.json(exerciseWithParsedTestCases);
  } catch (error) {
    console.error('获取编程练习详情失败:', error);
    return NextResponse.json({ error: '获取编程练习详情失败' }, { status: 500 });
  }
}

// 更新练习
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    const { exerciseId } = params;
    
    // 验证用户权限
    if (!session || session.user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: '未授权，只有教育者可以更新编程练习' },
        { status: 401 }
      );
    }

    // 先检查练习是否存在
    const existingExercise = await db.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!existingExercise) {
      return NextResponse.json({ error: '练习未找到' }, { status: 404 });
    }

    // 验证练习是否由当前用户创建
    if (existingExercise.userId !== session.user.id) {
      return NextResponse.json(
        { error: '未授权，您只能更新自己创建的练习' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // 处理测试用例
    if (body.testCases && Array.isArray(body.testCases)) {
      body.testCases = JSON.stringify(body.testCases);
    }

    // 更新练习
    const updatedExercise = await db.exercise.update({
      where: {
        id: exerciseId,
      },
      data: body,
    });

    // 转换测试用例回JSON格式
    const exerciseWithParsedTestCases = {
      ...updatedExercise,
      testCases: JSON.parse(updatedExercise.testCases || '[]'),
    };

    return NextResponse.json(exerciseWithParsedTestCases);
  } catch (error) {
    console.error('更新编程练习失败:', error);
    return NextResponse.json({ error: '更新编程练习失败' }, { status: 500 });
  }
}

// 删除练习
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    const { exerciseId } = params;
    
    // 验证用户权限
    if (!session || session.user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: '未授权，只有教育者可以删除编程练习' },
        { status: 401 }
      );
    }

    // 先检查练习是否存在
    const existingExercise = await db.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!existingExercise) {
      return NextResponse.json({ error: '练习未找到' }, { status: 404 });
    }

    // 验证练习是否由当前用户创建
    if (existingExercise.userId !== session.user.id) {
      return NextResponse.json(
        { error: '未授权，您只能删除自己创建的练习' },
        { status: 403 }
      );
    }

    // 删除练习
    await db.exercise.delete({
      where: {
        id: exerciseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除编程练习失败:', error);
    return NextResponse.json({ error: '删除编程练习失败' }, { status: 500 });
  }
} 