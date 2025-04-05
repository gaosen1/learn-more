import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'gaosen';

// Password encryption function
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Password verification function
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

interface TokenPayload {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Extract user information from request
export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

// Check if user has educator role
export function isEducator(user: { role: UserRole } | null): boolean {
  return user?.role === 'EDUCATOR';
}

// Clean user data by removing sensitive information
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Authentication function to be used in API routes
export async function auth(req?: NextRequest) {
  // If request is provided
  if (req) {
    const user = getUserFromRequest(req);
    if (user) {
      return {
        user,
        authenticated: true
      };
    }
    return null;
  }
  
  // When no request is provided (for direct function calls)
  // Returns a function that can be used to get the current session
  return async () => {
    // This is a simplified version
    // In a real implementation, you might want to check cookies or headers
    return null;
  };
} 