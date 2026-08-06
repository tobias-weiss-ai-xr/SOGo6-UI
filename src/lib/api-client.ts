/**
 * API Client for SOGo6
 *
 * Provides a unified client for all API requests with error handling,
 * authentication, and retry logic.
 */

import cookies from 'js-cookie';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get auth token from cookies
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return cookies.get('sogo6_session') || null;
}

/**
 * Build full URL from path
 */
function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

/**
 * Build headers with auth token
 */
function buildHeaders(authToken: string | null = null, custom?: Record<string, string>): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...custom,
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

// ============================================================================
// Response Handling
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  headers?: Headers;
}

interface ApiError {
  code: string;
  message: string;
  http_status: number;
  details?: any;
}

/**
 * Parse JSON response safely
 */
async function parseJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await parseJson(response);
  const success = response.ok;
  
  if (success) {
    return {
      success: true,
      data: data,
      statusCode: response.status,
      headers: response.headers,
    };
  }
  
  // Check for error structure from SOGo6
  const error = data?.error || data?.message || response.statusText;
  // const code = data?.error_code || response.status.toString();
  
  // if (data?.code && data?.message) {
  //   error = data.message;
  //   code = data.code;
  // }
  
  return {
    success: false,
    error: error,
    statusCode: response.status,
  };
}

/**
 * Check if error is authentication related
 */
// function isAuthError(error: ApiError | null, status: number): boolean {
//   if (!error) return status === 401 || status === 403;
//   return error.code === 'UNAUTHORIZED' || 
//          error.http_status === 401 || 
//          error.http_status === 403;
// }

// ============================================================================
// HTTP Methods
// ============================================================================

async function request<T>(
  method: string,
  path: string,
  body?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildUrl(path);
  const authToken = getAuthToken();
  
  const headers = buildHeaders(authToken, options.headers as Record<string, string>);
  
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    ...options,
    body: body ? JSON.stringify(body) : undefined,
  };
  
  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * GET request
 */
export async function get<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>('GET', path, undefined, options);
}

/**
 * POST request
 */
export async function post<T>(path: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>('POST', path, body, options);
}

/**
 * PUT request
 */
export async function put<T>(path: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>('PUT', path, body, options);
}

/**
 * DELETE request
 */
export async function del<T>(path: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>('DELETE', path, body, options);
}

/**
 * PATCH request
 */
export async function patch<T>(path: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return request<T>('PATCH', path, body, options);
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * GET with simple response (just data)
 */
export async function getSimple<T>(path: string): Promise<T | null> {
  const response = await get<T>(path);
  return response.success ? response.data : null;
}

/**
 * POST with simple response (just data)
 */
export async function postSimple<T>(path: string, body?: any): Promise<T | null> {
  const response = await post<T>(path, body);
  return response.success ? response.data : null;
}

// ============================================================================
// Dedicated API Clients (for better type safety)
// ============================================================================

// User API
export const userApi = {
  profile: {
    get: () => getSimple('/user/v1/profile'),
    update: (data: any) => postSimple('/user/v1/profile', data),
  },
};

// WebAuthn API
export const webauthnApi = {
  status: () => getSimple('/user/v1/webauthn'),
  registrationChallenge: (userVerification: string = 'preferred') => 
    getSimple(`/user/v1/webauthn/challenge/register?user_verification=${userVerification}`),
  register: (data: any) => postSimple('/user/v1/webauthn/register', data),
  loginChallenge: (userVerification: string = 'preferred') => 
    getSimple(`/user/v1/webauthn/challenge/login?user_verification=${userVerification}`),
  login: (data: any) => postSimple('/user/v1/webauthn/login', data),
  credentials: {
    list: () => getSimple('/user/v1/webauthn/credentials'),
    get: (id: string) => getSimple(`/user/v1/webauthn/credentials/${id}`),
    update: (id: string, data: any) => postSimple(`/user/v1/webauthn/credentials/${id}`, data),
    delete: (id: string) => del(`/user/v1/webauthn/credentials/${id}`),
  },
};

// Admin API
export const adminApi = {
  users: {
    list: () => getSimple('/admin/v1/users'),
    get: (id: string) => getSimple(`/admin/v1/users/${id}`),
    create: (data: any) => postSimple('/admin/v1/users', data),
    update: (id: string, data: any) => postSimple(`/admin/v1/users/${id}`, data),
    delete: (id: string) => del(`/admin/v1/users/${id}`),
  },
};

// ============================================================================
// Exports
// ============================================================================

export {
  get,
  post,
  put,
  del,
  patch,
  getSimple,
  postSimple,
};

export const apiClient = {
  get,
  post,
  put,
  del,
  patch,
  getSimple,
  postSimple,
};
