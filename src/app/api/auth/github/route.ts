import { NextRequest, NextResponse } from 'next/server';

// 请在.env文件中配置这些环境变量
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback';

export async function GET(request: NextRequest) {
  // 构建GitHub OAuth认证URL
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;
  
  // 重定向用户到GitHub授权页面
  return NextResponse.redirect(githubAuthUrl);
} 