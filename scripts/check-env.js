#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 
 * 用法: npm run env:check
 * 
 * 检查所有必需的环境变量是否存在于当前环境中
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const REQUIRED_VARS = [
  // 数据库
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL',
  
  // 认证
  'JWT_SECRET',
  
  // OAuth
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_REDIRECT_URI',
  
  // 前端
  'FRONTEND_URL',
  'NEXT_PUBLIC_API_URL',
];

// 获取当前环境
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`当前环境: ${NODE_ENV}`);

// 尝试加载对应环境的.env文件
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(process.cwd(), envFile);

try {
  if (fs.existsSync(envPath)) {
    console.log(`已找到环境配置文件: ${envFile}`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    
    // 将环境变量合并到process.env
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
  } else {
    console.log(`未找到环境配置文件: ${envFile}，将使用现有环境变量`);
  }
} catch (error) {
  console.error(`读取环境变量文件出错: ${error.message}`);
  process.exit(1);
}

// 检查必需的环境变量
const missingVars = [];
for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

// 输出结果
if (missingVars.length === 0) {
  console.log('✅ 所有必需的环境变量已设置');
} else {
  console.error('❌ 缺少以下必需的环境变量:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error(`\n请确保这些变量在 ${envFile} 文件中设置，或作为环境变量提供`);
  process.exit(1);
}

// 检查一些敏感的环境变量
if (process.env.JWT_SECRET === 'gaosen' && NODE_ENV === 'production') {
  console.warn('⚠️ 警告: 生产环境使用了默认的JWT密钥，建议更改为更复杂的随机字符串');
}

// 域名一致性检查
if (process.env.FRONTEND_URL && process.env.GITHUB_REDIRECT_URI) {
  const frontendUrl = new URL(process.env.FRONTEND_URL);
  try {
    const redirectUrl = new URL(process.env.GITHUB_REDIRECT_URI);
    if (frontendUrl.hostname !== redirectUrl.hostname) {
      console.warn(`⚠️ 警告: FRONTEND_URL (${frontendUrl.hostname}) 与 GITHUB_REDIRECT_URI (${redirectUrl.hostname}) 的域名不匹配`);
    }
  } catch (error) {
    console.warn(`⚠️ 警告: GITHUB_REDIRECT_URI 不是有效的URL: ${process.env.GITHUB_REDIRECT_URI}`);
  }
}

console.log(`\n环境检查完成`); 