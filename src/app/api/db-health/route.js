import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const results = {};
  let overallStatus = 'healthy';
  
  try {
    // Test 1: Basic connection
    try {
      const connectionTest = await prisma.$queryRaw`SELECT 1+1 as result`;
      results.connection = {
        status: 'success',
        latency: `${Date.now() - start}ms`,
        result: connectionTest[0].result
      };
    } catch (error) {
      results.connection = { status: 'error', error: error.message };
      overallStatus = 'unhealthy';
    }
    
    // Test 2: Query time
    try {
      const timeQuery = await prisma.$queryRaw`SELECT NOW() as time`;
      results.time = {
        status: 'success',
        latency: `${Date.now() - start}ms`,
        serverTime: timeQuery[0].time
      };
    } catch (error) {
      results.time = { status: 'error', error: error.message };
      overallStatus = 'unhealthy';
    }
    
    // Test 3: Read data (non-destructive)
    try {
      const startRead = Date.now();
      const userCount = await prisma.user.count();
      results.read = {
        status: 'success',
        latency: `${Date.now() - startRead}ms`,
        userCount
      };
    } catch (error) {
      results.read = { status: 'error', error: error.message };
      overallStatus = 'unhealthy';
    }
    
    // Database connection info
    results.info = {
      provider: prisma._engineConfig.activeProvider,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1' ? true : false
    };
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - start}ms`,
      tests: results
    }, { status: overallStatus === 'healthy' ? 200 : 500 });
  } catch (error) {
    return NextResponse.json({
      status: 'critical_error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 