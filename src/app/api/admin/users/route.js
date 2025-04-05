import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Get users list for admin purposes
export async function GET(request) {
  try {
    // Get current user and check if it's an educator (admin)
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    if (!isEducator(currentUser)) {
      return NextResponse.json(
        { error: 'Access denied. Only educators can access admin features.' },
        { status: 403 }
      );
    }
    
    // Get query parameters for search/filter if needed
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    // Build query conditions
    const whereConditions = {};
    
    if (searchTerm) {
      whereConditions.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Get users
    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 