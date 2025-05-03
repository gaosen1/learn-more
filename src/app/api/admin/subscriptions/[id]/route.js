import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

// Get a single subscription
export async function GET(request, { params }) {
  try {
    // Resolve dynamic params
    const resolvedParams = await params;
    const subscriptionId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(subscriptionId)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }
    
    // Get current user and check if it's an ADMIN
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Forbidden: Access restricted to administrators' },
        { status: 403 }
      );
    }
    
    // Get subscription details
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
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
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subscription);
    
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}

// Update subscription
export async function PUT(request, { params }) {
  try {
    // Resolve dynamic params
    const resolvedParams = await params;
    const subscriptionId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(subscriptionId)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }
    
    // Get current user and check if it's an ADMIN
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can update subscriptions' },
        { status: 403 }
      );
    }
    
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    
    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { plan, status, startDate, endDate, price, billingCycle, features } = body;
    
    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        plan: plan || existingSubscription.plan,
        status: status || existingSubscription.status,
        startDate: startDate ? new Date(startDate) : existingSubscription.startDate,
        endDate: endDate ? new Date(endDate) : existingSubscription.endDate,
        price: price ? parseFloat(price) : existingSubscription.price,
        billingCycle: billingCycle || existingSubscription.billingCycle,
        features: features || existingSubscription.features,
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
    
    return NextResponse.json(updatedSubscription);
    
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// Archive subscription (soft delete)
export async function DELETE(request, { params }) {
  try {
    // Resolve dynamic params
    const resolvedParams = await params;
    const subscriptionId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(subscriptionId)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }
    
    // Get current user and check if it's an ADMIN
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can archive subscriptions' },
        { status: 403 }
      );
    }
    
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    
    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Archive subscription (soft delete)
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isArchived: true,
      },
    });
    
    return NextResponse.json(
      { message: 'Subscription has been archived successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error archiving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to archive subscription' },
      { status: 500 }
    );
  }
} 