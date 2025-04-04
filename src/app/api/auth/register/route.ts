import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, sanitizeUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;
    
    // 验证必填字段
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '邮箱、密码和姓名为必填项' },
        { status: 400 }
      );
    }
    
    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请提供有效的邮箱地址' },
        { status: 400 }
      );
    }
    
    // 检查密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度必须至少为6个字符' },
        { status: 400 }
      );
    }
    
    // 验证用户角色
    const userRole = role === 'EDUCATOR' ? UserRole.EDUCATOR : UserRole.STUDENT;
    
    // 检查邮箱是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }
    
    // 哈希密码
    const hashedPassword = await hashPassword(password);
    
    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      }
    });
    
    // 生成JWT令牌
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });
    
    // 返回用户信息和token
    return NextResponse.json({
      user: sanitizeUser(newUser),
      token
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册过程中发生错误' },
      { status: 500 }
    );
  }
} 