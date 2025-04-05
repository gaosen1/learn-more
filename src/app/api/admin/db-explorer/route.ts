import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Make this endpoint dynamic
export const dynamic = 'force-dynamic';

/**
 * Protected DB explorer API - only accessible to admin/educators
 * Example usage: /api/admin/db-explorer?table=User&limit=10
 */
export async function GET(request: NextRequest) {
  // 1. Check authentication
  const user = getUserFromRequest(request);
  
  if (!user || user.role !== 'EDUCATOR') {
    return NextResponse.json(
      { error: 'Unauthorized. Only educators can access this endpoint.' },
      { status: 401 }
    );
  }
  
  // 2. Get parameters from URL
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Validate table param to prevent SQL injection
  const validTables = ['User', 'Course', 'Lesson', 'UserCourse', 'Subscription', 'Exercise', 'Solution'];
  
  if (!table || !validTables.includes(table)) {
    return NextResponse.json(
      { 
        error: 'Invalid table parameter',
        validTables
      },
      { status: 400 }
    );
  }
  
  try {
    let data;
    
    // Switch based on requested table
    switch (table) {
      case 'User':
        data = await prisma.user.findMany({
          take: limit,
          skip: offset,
          orderBy: { id: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            // Exclude password for security
            avatar: true
          }
        });
        break;
        
      case 'Course':
        data = await prisma.course.findMany({
          take: limit, 
          skip: offset,
          orderBy: { id: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                lessons: true,
                enrolledUsers: true
              }
            }
          }
        });
        break;
        
      case 'Lesson':
        data = await prisma.lesson.findMany({
          take: limit,
          skip: offset,
          orderBy: { id: 'desc' },
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        });
        break;
        
      case 'UserCourse':
        data = await prisma.userCourse.findMany({
          take: limit,
          skip: offset,
          orderBy: { id: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        });
        break;
        
      case 'Subscription':
        data = await prisma.subscription.findMany({
          take: limit,
          skip: offset,
          orderBy: { id: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        break;
        
      case 'Exercise':
        data = await prisma.exercise.findMany({
          take: limit,
          skip: offset,
          orderBy: { id: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                solutions: true
              }
            }
          }
        });
        break;
        
      case 'Solution':
        data = await prisma.solution.findMany({
          take: limit,
          skip: offset,
          orderBy: { id: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            exercise: {
              select: {
                id: true,
                title: true
              }
            }
          }
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Table not implemented' },
          { status: 400 }
        );
    }
    
    // Get total count for pagination
    const countKey = table.charAt(0).toLowerCase() + table.slice(1);
    const count = await (prisma as any)[countKey].count();
    
    return NextResponse.json({
      table,
      data,
      meta: {
        count,
        limit,
        offset,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch data from ${table}` },
      { status: 500 }
    );
  }
} 