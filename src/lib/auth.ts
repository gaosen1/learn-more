import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';

// 从环境变量获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'gaosen';

// 密码加密函数
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// 密码验证函数
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * 生成JWT令牌
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d' // 令牌30天后过期
  });
}

/**
 * 验证JWT令牌
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求头中提取令牌
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // 移除 'Bearer ' 前缀
}

// 从请求中提取用户信息
export function getUserFromRequest(req: NextRequest): { id: string; email: string; role: UserRole } | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

// 判断是否为教育者角色
export function isEducator(user: { role: UserRole } | null): boolean {
  return user?.role === 'EDUCATOR';
}

// 清理用户数据，移除敏感信息
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
} 