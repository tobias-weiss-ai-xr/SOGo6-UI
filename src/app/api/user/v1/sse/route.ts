/**
 * Server-Sent Events (SSE) Endpoint
 * Provides real-time notifications for mail, calendar, and other events
 * 
 * This is a Next.js API route that proxies SSE requests to the backend
 * or provides mock SSE in development with fakeApi
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConfig, getUseFakeApi } from '@/lib/api/client/config';

const BACKEND_BASE_URL = getConfig().baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Strip a trailing '/api/v1' if present — the SSE path below appends its own.
const BACKEND_ROOT = BACKEND_BASE_URL.replace(/\/api\/v1\/?$/, '');

export async function GET(_request: NextRequest) {
  // Check if we should use fake API
  if (getUseFakeApi()) {
    return handleFakeApiSSE(_request);
  }
  
  // Proxy to real backend
  return handleRealBackendSSE(_request);
}

/**
 * Handle SSE with real backend
 */
async function handleRealBackendSSE(request: NextRequest): Promise<Response> {
  const backendSseUrl = `${BACKEND_ROOT}/api/user/v1/sse`;
  
  try {
    // Build URL with query parameters
    const url = new URL(backendSseUrl);
    const searchParams = request.nextUrl.searchParams;
    
    for (const [key, value] of searchParams.entries()) {
      url.searchParams.set(key, value);
    }
    
    // Create headers, removing Next.js specific ones
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-proto');
    
    // Important: SSE requires these headers
    headers.set('Accept', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');
    
    // Proxy the request
    // Note: We need to use native fetch with streaming
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers as HeadersInit,
      credentials: 'include',
    });
    
    // Return the streamed response
    if (!response.ok) {
      throw new Error(`SSE Failed: ${response.status} ${response.statusText}`);
    }
    
    // Create a new response that streams SSE events
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });
    
    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE Proxy Error:', error);
    return NextResponse.json(
      { error: 'SSE Proxy Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}

/**
 * Handle SSE with fake API (mock data for development)
 */
async function handleFakeApiSSE(_request: NextRequest): Promise<Response> {
  // Create a stream of mock SSE events
  let interval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const message = `id: 1\ndata: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));
      
      // Simulate periodic events
      let eventId = 2;
      const types = ['mail', 'calendar', 'contact', 'notification'];
      const messages = [
        'New email received',
        'Calendar event reminder',
        'Contact updated',
        'New notification',
      ];
      
      // Send events every 5-10 seconds
      interval = setInterval(() => {
        const type = types[Math.floor(Math.random() * types.length)];
        const messageText = messages[Math.floor(Math.random() * messages.length)];
        
        const data = JSON.stringify({
          type,
          message: messageText,
          timestamp: new Date().toISOString(),
          data: {
            id: Math.random().toString(36).substring(2, 9),
            from: 'user@example.com',
            subject: 'Test message',
          },
        });
        
        // SSE format: id, type, data separated by newlines, terminated with double newline
        const event = `id: ${eventId}\ntype: ${type}\ndata: ${data}\n\n`;
        controller.enqueue(new TextEncoder().encode(event));
        eventId++;
      }, 5000 + Math.random() * 5000);
      
      // Cleanup when the consumer cancels the stream (no standard onclose)
      return undefined;
    },
    cancel() {
      clearInterval(interval);
    },
  });
  
  return new Response(stream, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-SSE-Mode': 'fakeApi',
    },
  });
}

// SSE requires streaming to be enabled
export const dynamic = 'force-dynamic';
export const revalidate = 0;
