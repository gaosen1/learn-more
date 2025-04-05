import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// 获取订阅计划列表
export async function GET(request) {
  try {
    // 返回可用的订阅计划
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
        description: '适合初次体验的学习者',
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
        description: '最受欢迎的选择',
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
        description: '无限制访问所有课程',
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
        description: '适合企业团队使用',
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

// 创建用户订阅
export async function POST(request) {
  try {
    // 获取当前用户
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized, please login first' },
        { status: 401 }
      );
    }
    
    // 解析请求体
    const body = await request.json();
    const { plan, billingCycle } = body;

    // 验证必填字段
    if (!plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 检查用户是否已有活跃订阅
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
    
    // 设置价格和特性
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
    
    // 计算结束日期
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
    
    // 创建订阅
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