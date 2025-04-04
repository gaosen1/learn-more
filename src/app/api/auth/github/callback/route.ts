import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import dns from 'dns';
import { promisify } from 'util';

// Environment variables for GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// DNS lookup
const dnsLookup = promisify(dns.lookup);

// Helper to check connectivity with detailed logs
async function checkGitHubConnectivity() {
  console.log('Testing GitHub connectivity...');
  
  try {
    // Attempt DNS resolution
    console.log('Resolving DNS for github.com...');
    const dnsResult = await dnsLookup('github.com');
    console.log('DNS resolution successful:', dnsResult);
    
    // Test connection with a simple HEAD request
    console.log('Testing HTTP connection to github.com...');
    try {
      const testResponse = await fetch('https://github.com', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // Increase timeout to 10 seconds
      });
      console.log('Connection test successful, status:', testResponse.status);
      return true;
    } catch (connError) {
      // Log the error but don't fail the entire process
      console.warn('GitHub connectivity test timeout, but will continue with API calls:', connError);
      return true; // Return true anyway to continue the process
    }
  } catch (error) {
    console.error('GitHub connectivity test failed:', error);
    // Even if DNS resolution fails, we'll still try the API calls
    return true;
  }
}

// Custom fetch with extensive logging and retry mechanism
async function fetchWithLogging(url, options, retryCount = 2) {
  console.log(`Fetching ${url}...`);
  console.log('Request options:', JSON.stringify(options, null, 2));
  
  const startTime = Date.now();
  
  try {
    // Use a longer timeout for actual requests
    const fetchOptions = {
      ...options,
      signal: AbortSignal.timeout(20000) // 20 second timeout
    };
    
    console.log('Starting fetch request...');
    const response = await fetch(url, fetchOptions);
    const endTime = Date.now();
    
    console.log(`Fetch completed in ${endTime - startTime}ms`);
    console.log('Response status:', response.status);
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    console.error(`Fetch failed after ${endTime - startTime}ms:`, error);
    
    // Retry logic
    if (retryCount > 0) {
      console.log(`Retrying request (${retryCount} attempts left)...`);
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithLogging(url, options, retryCount - 1);
    }
    
    // Try using our proxy route instead
    console.log('Direct connection failed, trying proxy...');
    try {
      const proxyUrl = `${FRONTEND_URL}/api/proxy/github`;
      console.log(`Using proxy at ${proxyUrl}`);
      
      // Safely parse the body if it exists
      let bodyData;
      if (options.body) {
        try {
          // If body is already a string, try to parse it as JSON
          if (typeof options.body === 'string') {
            bodyData = JSON.parse(options.body);
          } 
          // If it's a ReadableStream or other object, convert to string first if possible
          else if (options.body instanceof ReadableStream || options.body.toString) {
            bodyData = JSON.parse(options.body.toString());
          }
        } catch (parseError) {
          console.warn('Could not parse request body as JSON, sending as is:', parseError);
          // If we can't parse it, just pass it through as is
          bodyData = options.body;
        }
      }
      
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          method: options.method || 'GET',
          headers: options.headers || {},
          data: bodyData
        })
      });
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy request failed with status: ${proxyResponse.status}`);
      }
      
      const proxyData = await proxyResponse.json();
      
      // Create a Response object from proxy data
      const headers = new Headers();
      if (proxyData.headers) {
        Object.entries(proxyData.headers).forEach(([key, value]) => {
          headers.append(key, value as string);
        });
      }
      
      return new Response(
        typeof proxyData.data === 'string' 
          ? proxyData.data 
          : JSON.stringify(proxyData.data),
        {
          status: proxyData.status,
          headers
        }
      );
    } catch (proxyError) {
      console.error('Proxy fetch also failed:', proxyError);
      throw error; // Throw the original error
    }
  }
}

export async function GET(request: NextRequest) {
  console.log('GitHub OAuth callback received');
  
  // Get the code parameter from GitHub callback
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  console.log('Code parameter present:', !!code);
  
  if (!code) {
    // Redirect to login page if no code is provided
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
  }
  
  // Check GitHub connectivity before proceeding
  await checkGitHubConnectivity();
  
  try {
    console.log('Starting GitHub OAuth process with code:', code.substring(0, 4) + '...');
    
    // Step 1: Exchange the code for an access token with increased timeout
    console.log('Exchanging code for access token...');
    const tokenResponse = await fetchWithLogging('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })
    }).catch(error => {
      console.error('GitHub API connection error:', error);
      // Try alternative API endpoint as fallback
      console.log('Trying alternative API endpoint...');
      return fetchWithLogging('https://api.github.com/applications/'+GITHUB_CLIENT_ID+'/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code })
      }).catch(fallbackError => {
        console.error('Alternative endpoint also failed:', fallbackError);
        throw new Error('Failed to connect to GitHub API. Please try again later.');
      });
    });
    
    if (!tokenResponse.ok) {
      const responseText = await tokenResponse.text();
      console.error('GitHub token response not OK:', responseText);
      throw new Error(`GitHub API responded with status: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Token received:', tokenData.access_token ? 'Yes (token hidden)' : 'No');
    
    if (!tokenData.access_token) {
      console.error('Token data received but no access_token:', tokenData);
      throw new Error('Failed to get access token from GitHub');
    }
    
    // Step 2: Get user information using the access token
    console.log('Fetching user information...');
    const userResponse = await fetchWithLogging('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`
      }
    }).catch(error => {
      console.error('GitHub user API error:', error);
      throw new Error('Failed to fetch user data from GitHub');
    });
    
    if (!userResponse.ok) {
      const responseText = await userResponse.text();
      console.error('GitHub user response not OK:', responseText);
      throw new Error(`GitHub user API responded with status: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    console.log('User data received:', userData.id ? `Yes (ID: ${userData.id})` : 'No');
    
    if (!userData.id) {
      throw new Error('Failed to get user data from GitHub');
    }
    
    // Step 3: Get user email
    console.log('Fetching user email...');
    const emailResponse = await fetchWithLogging('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`
      }
    }).catch(error => {
      console.error('GitHub email API error:', error);
      throw new Error('Failed to fetch email data from GitHub');
    });
    
    if (!emailResponse.ok) {
      const responseText = await emailResponse.text();
      console.error('GitHub email response not OK:', responseText);
      throw new Error(`GitHub email API responded with status: ${emailResponse.status}`);
    }
    
    const emailData = await emailResponse.json();
    console.log('Email data received:', emailData.length ? `Yes (${emailData.length} emails)` : 'No');
    
    // Get primary email
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;
    console.log('Primary email found:', primaryEmail ? 'Yes' : 'No');
    
    if (!primaryEmail) {
      throw new Error('No email found from GitHub account');
    }
    
    // Step 4: Find or create user in database
    console.log('Looking up user in database:', primaryEmail);
    let user = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });
    
    if (!user) {
      // Create new user if not exists
      console.log('User not found, creating new user...');
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          name: userData.name || userData.login,
          password: '', // No password for social login users
          role: UserRole.STUDENT, // Default role is student
          avatar: userData.avatar_url
        }
      });
      console.log('New user created:', user.id);
    } else {
      console.log('Existing user found:', user.id);
      if (!user.avatar && userData.avatar_url) {
        // Update avatar if user exists but has no avatar
        console.log('Updating user avatar...');
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            avatar: userData.avatar_url
          }
        });
      }
    }
    
    // Step 5: Generate JWT token
    console.log('Generating JWT token...');
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Step 6: Redirect to frontend with token
    console.log('OAuth flow completed successfully, redirecting to frontend...');
    // Note: In production, use a more secure way to pass tokens, like httpOnly cookies
    return NextResponse.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
  }
} 