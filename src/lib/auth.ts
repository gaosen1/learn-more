import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';

// JWT密钥，应该存放在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env';

// 密码加密函数
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// 密码验证函数
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT生成函数
export function generateToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// JWT验证函数
export function verifyToken(token: string): { id: string; email: string; role: UserRole } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
  } catch (error) {
    return null;
  }
}

// 从请求中提取用户信息
export function getUserFromRequest(req: Request): { id: string; email: string; role: UserRole } | null {
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