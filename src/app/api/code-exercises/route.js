import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Get list of programming exercises
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query conditions
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

    // Get total count of exercises
    const totalExercises = await prisma.exercise.count({
      where
    });

    // Get list of exercises
    const exercises = await prisma.exercise.findMany({
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
    console.error('Failed to get programming exercises list:', error);
    return NextResponse.json({ error: 'Failed to get programming exercises list' }, { status: 500 });
  }
}

// Create new programming exercise
export async function POST(req) {
  try {
    const session = await auth();
    
    // Check user permissions
    if (!session || session.user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: 'Unauthorized, only educators can create programming exercises' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate required fields
    const { title, description, language, difficulty, initialCode, testCases } = body;
    
    if (!title || !description || !language || !difficulty || !initialCode || !testCases) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate test case format
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid test case is required' },
        { status: 400 }
      );
    }
    
    for (const testCase of testCases) {
      if (!testCase.description || !testCase.expectedOutput) {
        return NextResponse.json(
          { error: 'Each test case must include a description and expected output' },
          { status: 400 }
        );
      }
    }
    
    // Create new programming exercise
    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        language,
        difficulty,
        initialCode,
        testCases: JSON.stringify(testCases),
        category: body.category || 'General',
        userId: session.user.id
      }
    });
    
    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Failed to create programming exercise:', error);
    return NextResponse.json({ error: 'Failed to create programming exercise' }, { status: 500 });
  }
} 