#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * This script ensures the database is ready before the project starts:
 * 1. Check database connection
 * 2. Run necessary migrations
 * 3. Execute seed script (if needed)
 */

console.log('🔄 Checking database setup...');

try {
  // Check if migrations directory needs to be created
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('✅ Created migrations directory');
  }

  // Run Prisma migrations (if there are changes)
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations applied');

  // Generate Prisma client
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // Execute seed script
  console.log('🔄 Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');

  console.log('✅ Database setup completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
} 