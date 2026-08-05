/**
 * API Router
 * Routes requests to real backend or fake API based on environment configuration
 */

import { getConfig, getUseFakeApi } from './client/config';

/**
 * Route API requests based on configuration
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_ENABLE_FAKE_API=true (default in development)
 * - NEXT_PUBLIC_ENABLE_FAKE_API=false (default in production)
 * 
 * This allows developers to work without running the backend server
 * while production always uses the real backend.
 */

/**
 * Determine which API URL to use
 */
export function getApiBaseUrl(): string {
  const config = getConfig();
  
  // In production, always use the configured backend
  if (process.env.NODE_ENV === 'production') {
    return config.baseUrl;
  }
  
  // In development, use fake API if enabled
  if (getUseFakeApi()) {
    return '/fakeApi';
  }
  
  // Otherwise use real backend
  return config.baseUrl;
}

/**
 * Check if we're using fake API
 */
export function isUsingFakeApi(): boolean {
  return getUseFakeApi() && process.env.NODE_ENV !== 'production';
}

/**
 * Force the use of real API (useful for testing)
 */
export function forceRealApi(): void {
  const config = getConfig();
  config.enableFakeApi = false;
}

/**
 * Force the use of fake API (useful for testing)
 */
export function forceFakeApi(): void {
  const config = getConfig();
  config.enableFakeApi = true;
}

/**
 * Toggle between real and fake API
 */
export function toggleApi(): void {
  const config = getConfig();
  config.enableFakeApi = !config.enableFakeApi;
  
  const action = config.enableFakeApi ? 'enabled' : 'disabled';
  console.log(`[API Router] Fake API ${action}. Now using: ${getApiBaseUrl()}`);
}

/**
 * Convert endpoint path from OpenAPI format to actual API format
 * 
 * OpenAPI paths: /api/v1/mail/mailboxes
 * Real API paths: /api/v1/mail/mailboxes (same)
 * Fake API paths: /mail/mailboxes (without /api/v1 prefix)
 */
export function convertEndpoint(endpoint: string): string {
  // If using fake API, remove /api/v1 prefix
  if (isUsingFakeApi()) {
    // Convert /api/v1/... to /...
    return endpoint.replace(/^\/api\/v\d+/, '');
  }
  
  // Otherwise return as-is
  return endpoint;
}

/**
 * Get the full URL for an API request
 */
export function getFullUrl(endpoint: string, params?: Record<string, string | number>): string {
  const baseUrl = getApiBaseUrl();
  const convertedEndpoint = convertEndpoint(endpoint);
  
  // Build URL with path parameters
  let url = convertedEndpoint;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  
  // Combine base URL and endpoint
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const endpointClean = url.startsWith('/') ? url : `/${url}`;
  
  return `${base}${endpointClean}`;
}

/**
 * Test connection to real backend
 */
export async function testBackendConnection(): Promise<{
  success: boolean;
  message: string;
  endpoint?: string;
  latency?: number;
  error?: string;
}> {
  const config = getConfig();
  const testEndpoint = `${config.baseUrl}/api/v1/health/ping`;
  
  try {
    const start = Date.now();
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const latency = Date.now() - start;
    
    if (response.ok) {
      return {
        success: true,
        message: 'Connection successful',
        endpoint: testEndpoint,
        latency,
      };
    } else {
      return {
        success: false,
        message: 'Connection failed',
        endpoint: testEndpoint,
        latency,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Connection error',
      endpoint: testEndpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test connection to fake API
 */
export async function testFakeApiConnection(): Promise<{
  success: boolean;
  message: string;
  endpoint?: string;
  error?: string;
}> {
  const testEndpoint = '/fakeApi/system';
  
  try {
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      return {
        success: true,
        message: 'Fake API is available',
        endpoint: testEndpoint,
      };
    } else {
      return {
        success: false,
        message: 'Fake API connection failed',
        endpoint: testEndpoint,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Fake API connection error',
      endpoint: testEndpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Auto-detect which API to use
 * Tries real backend first, falls back to fake API if unavailable
 */
export async function autoDetectApi(): Promise<{
  usingReal: boolean;
  realAvailable: boolean;
  fakeAvailable: boolean;
}> {
  // In production, always use real API
  if (process.env.NODE_ENV === 'production') {
    return { usingReal: true, realAvailable: true, fakeAvailable: false };
  }
  
  // Check real backend
  const realTest = await testBackendConnection();
  const realAvailable = realTest.success;
  
  // Check fake API
  const fakeTest = await testFakeApiConnection();
  const fakeAvailable = fakeTest.success;
  
  // Decide which to use
  const config = getConfig();
  let usingReal = true;
  
  // If real is available and fake is disabled, use real
  if (realAvailable && !config.enableFakeApi) {
    usingReal = true;
  }
  // If real is not available but fake is, use fake
  else if (!realAvailable && fakeAvailable) {
    usingReal = false;
  }
  // If both are available, prefer real in production, fake in development
  else if (realAvailable && fakeAvailable) {
    usingReal = process.env.NODE_ENV !== 'development' || !config.enableFakeApi;
  }
  // If neither is available, default to real (will fail gracefully)
  else {
    usingReal = true;
  }
  
  return { usingReal, realAvailable, fakeAvailable };
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getApiBaseUrl,
  isUsingFakeApi,
  forceRealApi,
  forceFakeApi,
  toggleApi,
  convertEndpoint,
  getFullUrl,
  testBackendConnection,
  testFakeApiConnection,
  autoDetectApi,
};
