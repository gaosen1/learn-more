#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

/**
 * This script ensures the database is ready before the project starts:
 * 1. Check database connection
 * 2. Run necessary migrations
 * 3. Execute seed script (for all environments, with safeguards)
 * 4. Fix sequence issues (especially for Neon DB in production)
 */

console.log('🔄 Checking database setup...');

// Get environment
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

// Create a Prisma client for database checks
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if migrations directory needs to be created
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✅ Created migrations directory');
    }

    // Run Prisma migrations (if there are changes)
    console.log('🔄 Running database migrations...');
    if (isProduction) {
      // In production, just apply existing migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Database migrations applied');
    } else {
      // In development, create migrations as needed
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      console.log('✅ Database migrations applied');
    }

    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');

    // Check if database is empty (no users)
    const userCount = await prisma.user.count();

    // Execute seed script only if the database is empty
    if (userCount === 0) {
      console.log('🔄 Database is empty, running seed script for initial data...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully');
    } else {
      console.log('⏩ Database already contains data, skipping seed script.');
    }

    // Fix sequence issues (especially important for Neon DB in production)
    console.log('🔄 Fixing database sequences...');
    execSync('node scripts/fix-db-sequence.js', { stdio: 'inherit' });
    console.log('✅ Database sequences fixed');

    console.log('✅ Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 