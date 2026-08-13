/**
 * API Client Configuration
 * Central configuration for all API client operations
 */

// Environment variables (set in .env.local or build config)
declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_ENABLE_FAKE_API?: string;
    NEXT_PUBLIC_SSE_ENABLED?: string;
    NEXT_PUBLIC_SSE_ENDPOINT?: string;
    NODE_ENV: string;
  };
};

/**
 * API Configuration Interface
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  enableFakeApi: boolean;
  debug: boolean;
  // Whether SSE (Server-Sent Events) are enabled
  sseEnabled: boolean;
  // SSE endpoint URL (optional, defaults to baseUrl + /sse)
  sseEndpoint?: string;
}

/**
 * Default API configuration
 */
export const defaultConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
  timeout: 30000, // 30 seconds
  enableFakeApi: process.env.NEXT_PUBLIC_ENABLE_FAKE_API !== 'false',
  debug: process.env.NODE_ENV === 'development',
  sseEnabled: getBoolEnv(process.env.NEXT_PUBLIC_SSE_ENABLED, false),
  sseEndpoint: process.env.NEXT_PUBLIC_SSE_ENDPOINT,
};

/**
 * Safely parse boolean environment variable
 */
function getBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return defaultValue;
}

/**
 * Create API configuration
 */
export function createConfig(overrides: Partial<ApiConfig> = {}): ApiConfig {
  return { ...defaultConfig, ...overrides };
}

/**
 * Get current API configuration
 */
export function getConfig(): ApiConfig {
  return defaultConfig;
}

/**
 * Set API configuration (useful for testing)
 */
export function setConfig(config: Partial<ApiConfig>): void {
  Object.assign(defaultConfig, config);
}

/**
 * Build full URL for an endpoint
 */
export function buildUrl(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): string {
  const config = getConfig();
  
  // Replace path parameters
  let url = endpoint;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, String(value));
  }
  
  // Build query string for remaining params
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (url.includes(`:${key}`)) {
      // Already replaced in path
      continue;
    }
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  }
  
  const queryString = queryParams.toString();
  const base = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
  const endpointClean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${base}${endpointClean}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Determine if we should use fake API
 */
export function getUseFakeApi(): boolean {
  const config = getConfig();
  
  // In production, never use fake API
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  return config.enableFakeApi;
}
