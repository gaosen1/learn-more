import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, sanitizeUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 从请求中获取用户信息
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: '未授权，请先登录' },
        { status: 401 }
      );
    }
    
    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回用户信息（不包含密码）
    return NextResponse.json({
      user: sanitizeUser(user)
    });
    
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '获取用户信息时发生错误' },
      { status: 500 }
    );
  }
} 