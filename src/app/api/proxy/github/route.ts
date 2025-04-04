import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API route to relay requests to GitHub API
 * This helps bypass network issues when connecting directly to GitHub
 */
export async function POST(request: NextRequest) {
  try {
    // Log incoming proxy request
    console.log('GitHub API proxy request received');
    
    // Get request body
    const body = await request.json();
    const { url, method = 'GET', headers = {}, data } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }
    
    console.log(`Proxying request to: ${url} (${method})`);
    
    // Set up request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      signal: AbortSignal.timeout(20000) // 20-second timeout
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    // Make request to GitHub API
    const startTime = Date.now();
    const response = await fetch(url, requestOptions);
    const endTime = Date.now();
    
    console.log(`Proxy request completed in ${endTime - startTime}ms with status: ${response.status}`);
    
    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Return response to client
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    });
  } catch (error: any) {
    console.error('GitHub API proxy error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to proxy request to GitHub API',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 