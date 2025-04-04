import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken, sanitizeUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: 'The email address and password are required' },
        { status: 400 }
      );
    }
    
    // 查询用户
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // 用户不存在
    if (!user) {
      return NextResponse.json(
        { error: 'The email address or password is incorrect' },
        { status: 401 }
      );
    }
    
    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'The email address or password is incorrect' },
        { status: 401 }
      );
    }
    
    // 生成JWT令牌
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // 返回用户信息和token
    return NextResponse.json({
      user: sanitizeUser(user),
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 