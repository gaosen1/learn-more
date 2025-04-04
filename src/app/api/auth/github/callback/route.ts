import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// 请在.env文件中配置这些环境变量
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  // 从URL参数中获取GitHub返回的code
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    // 如果没有code参数，重定向到登录页面
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
  }
  
  try {
    // 第1步：使用code交换访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get access token from GitHub');
    }
    
    // 第2步：使用访问令牌获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    if (!userData.id) {
      throw new Error('Failed to get user data from GitHub');
    }
    
    // 第3步：获取用户邮箱
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`
      }
    });
    
    const emailData = await emailResponse.json();
    
    // 获取用户的主要邮箱
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;
    
    if (!primaryEmail) {
      throw new Error('No email found from GitHub account');
    }
    
    // 第4步：在数据库中查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });
    
    if (!user) {
      // 如果用户不存在，创建新用户
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          name: userData.name || userData.login,
          password: '', // 社交登录用户没有密码
          role: UserRole.STUDENT, // 默认为学生角色
          avatar: userData.avatar_url
        }
      });
    } else if (!user.avatar && userData.avatar_url) {
      // 如果用户存在但没有头像，更新头像
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          avatar: userData.avatar_url
        }
      });
    }
    
    // 第5步：生成JWT令牌
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // 第6步：重定向到前端并传递令牌
    // 注意：在生产环境中，应该使用更安全的方式传递令牌，例如通过cookies或服务端session
    return NextResponse.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
  }
} 