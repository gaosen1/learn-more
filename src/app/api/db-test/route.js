import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to query the database
    const dbTest = await prisma.$queryRaw`SELECT NOW() as time`;
    
    // Run a simple query to test Prisma connection
    const userCount = await prisma.user.count();
    
    // Return success with database info
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      serverTime: dbTest[0].time,
      userCount: userCount,
      dbProvider: prisma._engineConfig.activeProvider,
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Return error information
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 