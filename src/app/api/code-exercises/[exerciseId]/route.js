import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Get exercise details
export async function GET(req, { params }) {
  try {
    const { exerciseId } = params;

    if (!exerciseId) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Convert test cases back to JSON format
    const exerciseWithParsedTestCases = {
      ...exercise,
      testCases: JSON.parse(exercise.testCases || '[]'),
    };

    return NextResponse.json(exerciseWithParsedTestCases);
  } catch (error) {
    console.error('Failed to get exercise details:', error);
    return NextResponse.json({ error: 'Failed to get exercise details' }, { status: 500 });
  }
}

// Update exercise
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    const { exerciseId } = params;
    
    // Verify user permissions
    if (!session || session.user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: 'Unauthorized, only educators can update exercises' },
        { status: 401 }
      );
    }

    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!existingExercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Verify exercise was created by current user
    if (existingExercise.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized, you can only update exercises you created' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Process test cases
    if (body.testCases && Array.isArray(body.testCases)) {
      body.testCases = JSON.stringify(body.testCases);
    }

    // Update exercise
    const updatedExercise = await prisma.exercise.update({
      where: {
        id: exerciseId,
      },
      data: body,
    });

    // Convert test cases back to JSON format
    const exerciseWithParsedTestCases = {
      ...updatedExercise,
      testCases: JSON.parse(updatedExercise.testCases || '[]'),
    };

    return NextResponse.json(exerciseWithParsedTestCases);
  } catch (error) {
    console.error('Failed to update exercise:', error);
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 });
  }
}

// Delete exercise
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    const { exerciseId } = params;
    
    // Verify user permissions
    if (!session || session.user.role !== 'EDUCATOR') {
      return NextResponse.json(
        { error: 'Unauthorized, only educators can delete exercises' },
        { status: 401 }
      );
    }

    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!existingExercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Verify exercise was created by current user
    if (existingExercise.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized, you can only delete exercises you created' },
        { status: 403 }
      );
    }

    // Delete exercise
    await prisma.exercise.delete({
      where: {
        id: exerciseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete exercise:', error);
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 });
  }
} 