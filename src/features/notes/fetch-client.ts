/**
 * Fetch Client for Notes API
 * Simple fetch wrapper for notes API calls
 */

import { getConfig } from '@/lib/api/client/config';

/**
 * Simple fetch wrapper that adds base URL and headers for notes API
 */
export async function fetchClient(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const config = getConfig();
  const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
  
  // Build URL
  const url = typeof input === 'string' 
    ? input.startsWith('http') 
      ? input 
      : `${baseUrl}${input.startsWith('/') ? input : `/${input}`}`
    : input;

  // Build headers
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  // Make the request
  return fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });
}

export default fetchClient;
