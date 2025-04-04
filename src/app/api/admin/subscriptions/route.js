import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isEducator } from '@/lib/auth';

// Get subscriptions with paging
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const searchTerm = searchParams.get('search');
    const showArchived = searchParams.get('showArchived') === 'true';

    // Calculate pagination values
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (plan) {
      whereConditions.plan = plan;
    }
    
    if (!showArchived) {
      whereConditions.isArchived = false;
    }
    
    if (searchTerm) {
      whereConditions.OR = [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    
    // Get subscriptions with pagination
    const subscriptions = await prisma.subscription.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
    
    // Get total count for pagination
    const totalCount = await prisma.subscription.count({
      where: whereConditions,
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Return response with pagination metadata
    return NextResponse.json({
      subscriptions,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// Create a new subscription
export async function POST(request) {
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
    
    // Parse request body
    const body = await request.json();
    const { userId, plan, status, startDate, endDate, price, billingCycle, features } = body;

    // Validate required fields
    if (!userId || !plan || !price || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: parseInt(userId, 10),
        plan,
        status: status || 'ACTIVE',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        price: parseFloat(price),
        billingCycle,
        features: features || '{}',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 