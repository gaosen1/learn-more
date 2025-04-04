#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 此脚本用于确保数据库在项目启动前已经准备好:
 * 1. 检查数据库连接
 * 2. 运行必要的迁移
 * 3. 执行种子脚本（如果需要）
 */

console.log('🔄 Checking database setup...');

try {
  // 检查是否需要创建migrations目录
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('✅ Created migrations directory');
  }

  // 运行Prisma迁移（如果有更改）
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations applied');

  // 生成Prisma客户端
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // 执行种子脚本
  console.log('🔄 Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');

  console.log('✅ Database setup completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
} 