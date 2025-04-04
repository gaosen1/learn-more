import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, sanitizeUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user information from request
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Get latest user information from database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user information (without password)
    return NextResponse.json({
      user: sanitizeUser(user)
    });
    
  } catch (error) {
    console.error('Error getting user information:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user information' },
      { status: 500 }
    );
  }
} 