import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Service Worker registration handler
// This route is automatically picked up by @serwist/turbopack when wrapped in withSerwist()

export async function GET(_request: NextRequest): Promise<NextResponse> {
  // The actual service worker file is served by the @serwist/turbopack plugin
  // This route handler exists so Next.js knows to register the service worker
  return NextResponse.next();
}
