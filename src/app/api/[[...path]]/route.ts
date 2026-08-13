import { NextRequest, NextResponse } from 'next/server';
import { isUsingFakeApi } from '@/lib/api/router';

/**
 * API Proxy Route Handler
 * 
 * This handler proxies requests from /api/v1/* to the backend server.
 * It allows the frontend to make direct API calls that get proxied through.
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_BASE_URL: Base URL for the backend server (default: http://localhost:5000)
 * 
 * When fake API is enabled (in development), this will redirect to fakeApi.
 * In production, it always proxies to the real backend.
 */

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'GET');
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'POST');
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'PUT');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'DELETE');
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'PATCH');
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'HEAD');
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(request, context, 'OPTIONS');
}

/**
 * Handle proxy request
 */
async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
  method: string
): Promise<NextResponse> {
  // Check if we should use fake API
  if (isUsingFakeApi()) {
    const { path } = await context.params;
    const apiPath = path?.join('/') || '';
    
    // Redirect to fakeApi
    const fakeApiPath = `/fakeApi/${apiPath.replace(/^api\/v1\//, '')}`;
    return NextResponse.redirect(new URL(fakeApiPath, request.url));
  }
  
  // Proxy to backend
  try {
    const { path } = await context.params;
    const apiPath = path?.join('/') || '';
    
    // Build target URL
    const targetUrl = new URL(`${BACKEND_BASE_URL}/${apiPath}`);
    
    // Preserve query parameters
    const searchParams = request.nextUrl.searchParams;
    if (searchParams.toString()) {
      targetUrl.search = searchParams.toString();
    }
    
    // Build request init
    const requestInit: RequestInit = {
      method,
      headers: removeProxyHeaders(request.headers),
    };
    
    // Include body for methods that support it
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Try to get body - clone request to avoid consuming stream
      const body = await cloneRequestBody(request);
      if (body) {
        requestInit.body = body;
      }
    }
    
    // Add credentials if present in original request
    // Note: In browser, fetch automatically includes credentials for same-origin
    // For cross-origin, we need to explicitly set credentials: 'include'
    // But we can't do that from server component, so we rely on browser
    
    // Proxy the request
    const response = await fetch(targetUrl.toString(), requestInit);
    
    // Create response with proxy headers removed
    return proxyResponse(response, request);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      {
        error: 'API Proxy Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}

/**
 * Remove proxy-specific headers from request
 */
function removeProxyHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of headers.entries()) {
    // Skip Next.js and proxy-specific headers
    if (key.toLowerCase().startsWith('x-') || 
        key.toLowerCase().startsWith('host') ||
        key.toLowerCase().startsWith('connection')) {
      continue;
    }
    result[key] = value;
  }
  
  return result;
}

/**
 * Clone request body for reuse
 */
async function cloneRequestBody(request: Request): Promise<BodyInit | null> {
  // Check if Content-Type is JSON
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      const body = await request.json();
      return JSON.stringify(body);
    } catch {
      return null;
    }
  }
  
  // Check if it's FormData
  if (contentType?.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const newFormData = new FormData();
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob) {
          // Clone blob — preserve filename when it's a File
          const blob = new Blob([value as BlobPart], { type: value.type });
          const name = typeof (value as File).name === 'string' ? (value as File).name : 'upload';
          newFormData.append(key, blob, name);
        } else {
          newFormData.append(key, value as string);
        }
      }
      
      return newFormData;
    } catch {
      return null;
    }
  }
  
  // For text
  if (contentType?.includes('text/')) {
    try {
      return await request.text();
    } catch {
      return null;
    }
  }
  
  // For binary data
  try {
    return await request.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Create response from proxy response
 */
function proxyResponse(proxyResponse: Response, _originalRequest: Request): NextResponse {
  // Create headers
  const headers = new Headers();
  
  // Copy allowed headers from proxy response
  const allowedHeaders = [
    'content-type',
    'content-length',
    'content-disposition',
    'content-encoding',
    'cache-control',
    'etag',
    'last-modified',
    'location',
    'authorization',
    'set-cookie',
    'x-total-count',
    'x-page',
    'x-per-page',
    'x-total-pages',
  ];
  
  for (const [key, value] of proxyResponse.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  
  // Add CORS headers for API responses
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle redirect responses
  if (proxyResponse.status >= 300 && proxyResponse.status < 400) {
    const location = proxyResponse.headers.get('location');
    if (location) {
      return NextResponse.redirect(location, proxyResponse.status);
    }
  }
  
  // Create NextResponse
  return new NextResponse(proxyResponse.body, {
    status: proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers: headers as HeadersInit,
  });
}

export const dynamic = 'force-dynamic';
