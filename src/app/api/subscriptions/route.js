import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Configure this route to be dynamic even in export mode
export const dynamic = 'force-dynamic';

// Get subscription plan list
export async function GET(request) {
  try {
    // Return available subscription plans
    const subscriptionPlans = [
      {
        id: 'BASIC',
        name: 'Basic',
        price: 9.99,
        billingCycle: 'monthly',
        features: {
          coursesLimit: 5,
          downloadContent: false,
          supportLevel: 'basic',
          certificatesEnabled: false
        },
        description: 'Suitable for first time learners',
        popular: false
      },
      {
        id: 'STANDARD',
        name: 'Standard',
        price: 19.99,
        billingCycle: 'monthly',
        features: {
          coursesLimit: 15,
          downloadContent: true,
          supportLevel: 'standard',
          certificatesEnabled: true
        },
        description: 'The most popular choice',
        popular: true
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        price: 29.99,
        billingCycle: 'monthly',
        features: {
          coursesLimit: -1, // unlimited
          downloadContent: true,
          supportLevel: 'priority',
          certificatesEnabled: true,
          mentorSupport: true
        },
        description: 'Unlimited access to all courses',
        popular: false
      },
      {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 299.99,
        billingCycle: 'yearly',
        features: {
          coursesLimit: -1, // unlimited
          downloadContent: true,
          supportLevel: 'dedicated',
          certificatesEnabled: true,
          mentorSupport: true,
          customBranding: true,
          teamManagement: true
        },
        description: 'Suitable for enterprise teams',
        popular: false
      }
    ];
    
    return NextResponse.json({ subscriptionPlans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

// Create user subscription
export async function POST(request) {
  try {
    // Get current user
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { plan, billingCycle } = body;

    // Validate required fields
    if (!plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: parseInt(currentUser.id),
        status: 'ACTIVE',
      },
    });
    
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }
    
    // Set price and features
    let price, features;
    switch (plan) {
      case 'BASIC':
        price = 9.99;
        features = JSON.stringify({
          coursesLimit: 5,
          downloadContent: false,
          supportLevel: 'basic',
          certificatesEnabled: false
        });
        break;
      case 'STANDARD':
        price = 19.99;
        features = JSON.stringify({
          coursesLimit: 15,
          downloadContent: true,
          supportLevel: 'standard',
          certificatesEnabled: true
        });
        break;
      case 'PREMIUM':
        price = 29.99;
        features = JSON.stringify({
          coursesLimit: -1,
          downloadContent: true,
          supportLevel: 'priority',
          certificatesEnabled: true,
          mentorSupport: true
        });
        break;
      case 'ENTERPRISE':
        price = 299.99;
        features = JSON.stringify({
          coursesLimit: -1,
          downloadContent: true,
          supportLevel: 'dedicated',
          certificatesEnabled: true,
          mentorSupport: true,
          customBranding: true,
          teamManagement: true
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid subscription plan' },
          { status: 400 }
        );
    }
    
    // Calculate end date
    let endDate = new Date();
    if (billingCycle === 'monthly') {
      endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
    } else if (billingCycle === 'quarterly') {
      endDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
    } else if (billingCycle === 'yearly') {
      endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    } else {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }
    
    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: parseInt(currentUser.id),
        plan,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
        price,
        billingCycle,
        features,
      },
    });
    
    return NextResponse.json(
      { 
        message: 'Subscription created successfully', 
        subscription 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 