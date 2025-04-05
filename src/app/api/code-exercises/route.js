import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

// 获取编程练习列表
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {};
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (language) {
      where.language = language;
    }
    
    if (category) {
      where.category = category;
    }

    // 获取练习总数
    const totalExercises = await db.exercise.count({
      where
    });

    // 获取练习列表
    const exercises = await db.exercise.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        language: true,
        category: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      exercises,
      meta: {
        total: totalExercises,
        page,
        limit,
        pageCount: Math.ceil(totalExercises / limit)
      }
    });
  } catch (error) {
    console.error('获取编程练习列表失败:', error);
    return NextResponse.json({ error: '获取编程练习列表失败' }, { status: 500 });
  }
}

// 创建新的编程练习
export async function POST(req) {
  try {
    const session = await auth();
    
    // 检查用户权限
    if (!session || session.user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: '未授权，只有教育者可以创建编程练习' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // 验证必填字段
    const { title, description, language, difficulty, initialCode, testCases } = body;
    
    if (!title || !description || !language || !difficulty || !initialCode || !testCases) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }
    
    // 验证测试用例格式
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: '至少需要一个有效的测试用例' },
        { status: 400 }
      );
    }
    
    for (const testCase of testCases) {
      if (!testCase.description || !testCase.expectedOutput) {
        return NextResponse.json(
          { error: '每个测试用例必须包含描述和预期输出' },
          { status: 400 }
        );
      }
    }
    
    // 创建新的编程练习
    const exercise = await db.exercise.create({
      data: {
        title,
        description,
        language,
        difficulty,
        initialCode,
        testCases: JSON.stringify(testCases),
        category: body.category || '通用',
        userId: session.user.id
      }
    });
    
    return NextResponse.json(exercise);
  } catch (error) {
    console.error('创建编程练习失败:', error);
    return NextResponse.json({ error: '创建编程练习失败' }, { status: 500 });
  }
} 