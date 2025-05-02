import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken, sanitizeUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'The email address and password are required' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // User not found
    if (!user) {
      return NextResponse.json(
        { error: 'The email address or password is incorrect' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'The email address or password is incorrect' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Sanitize user data before sending
    const sanitizedUser = sanitizeUser(user);

    // Create response with user data
    const response = NextResponse.json({
      user: sanitizedUser,
      // message: 'Login successful' // Optional success message
      // REMOVED token from response body
    });

    // Set token as an HttpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true, // Most important for security
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      path: '/', // Available on all paths
      maxAge: 60 * 60 * 24 * 30, // 30 days expiry (same as token)
      sameSite: 'lax' // Recommended for most cases
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 