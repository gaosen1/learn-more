#!/usr/bin/env node

/**
 * 数据库序列修复脚本
 * 
 * 此脚本用于修复PostgreSQL自动递增序列的问题
 * 在某些情况下，特别是使用Neon数据库时，序列可能不会正确初始化
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSequences() {
  console.log('开始修复数据库序列...');
  
  try {
    // 1. 修复 User 表序列
    console.log('正在修复 User 表序列...');
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"User"', 'id'), 
                    (SELECT COALESCE(MAX(id), 0) + 1 FROM "User"), 
                    false);
    `);
    
    // 2. 修复 Subscription 表序列
    console.log('正在修复 Subscription 表序列...');
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"Subscription"', 'id'), 
                    (SELECT COALESCE(MAX(id), 0) + 1 FROM "Subscription"), 
                    false);
    `);
    
    // 3. 修复 Course 表序列
    console.log('正在修复 Course 表序列...');
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"Course"', 'id'), 
                    (SELECT COALESCE(MAX(id), 0) + 1 FROM "Course"), 
                    false);
    `);
    
    // 4. 修复 UserCourse 表序列
    console.log('正在修复 UserCourse 表序列...');
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"UserCourse"', 'id'), 
                    (SELECT COALESCE(MAX(id), 0) + 1 FROM "UserCourse"), 
                    false);
    `);
    
    // 5. 修复 Lesson 表序列
    console.log('正在修复 Lesson 表序列...');
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"Lesson"', 'id'), 
                    (SELECT COALESCE(MAX(id), 0) + 1 FROM "Lesson"), 
                    false);
    `);
    
    console.log('序列修复完成！');
  } catch (error) {
    console.error('修复序列时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行修复函数
fixSequences(); 