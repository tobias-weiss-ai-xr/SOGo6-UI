/**
 * Base API Client
 * Provides common HTTP request functionality with error handling and interceptors
 */

import { getConfig, buildUrl, getUseFakeApi } from './config';
import type { BackendResponse } from '../backend-response';
import { unwrapBackendResponse as unwrapResponse } from '../backend-response';

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Request Options
 */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
}

/**
 * Response with data
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * Error Response
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  data?: any;
}



/**
 * Token refresh callback type
 */
export type TokenRefreshCallback = (refreshToken: string) => Promise<{ jwt_token: string; refresh_token: string }>;

/**
 * Base API Client Class
 */
export class BaseApiClient {
  private config = getConfig();
  private interceptors: Array<{
    request?: (options: RequestOptions) => RequestOptions | Promise<RequestOptions>;
    response?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
    error?: (error: ApiError) => ApiError | Promise<ApiError>;
  }> = [];
  
  /**
   * Token refresh queue - prevents multiple simultaneous refresh attempts
   */
  private tokenRefreshPromise: Promise<{ jwt_token: string; refresh_token: string }> | null = null;
  
  /**
   * Token refresh callback - should be set to your auth API's refresh method
   */
  private tokenRefreshCallback: TokenRefreshCallback | null = null;
  
  /**
   * Current JWT token (can be set/updated by token refresh)
   */
  private currentJwtToken: string | null = null;
  
  /**
   * Current refresh token
   */
  private currentRefreshToken: string | null = null;

  /**
   * Add an interceptor
   */
  addInterceptor(interceptor: {
    request?: (options: RequestOptions) => RequestOptions | Promise<RequestOptions>;
    response?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
    error?: (error: ApiError) => ApiError | Promise<ApiError>;
  }): void {
    this.interceptors.push(interceptor);
  }

  /**
   * Remove an interceptor
   */
  removeInterceptor(index: number): void {
    this.interceptors.splice(index, 1);
  }

  /**
   * Build headers for request
   */
  protected buildHeaders(authToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(options: RequestOptions): Promise<RequestOptions> {
    let result = { ...options };
    
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        result = await interceptor.request(result);
      }
    }
    
    return result;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let result = response;
    
    for (const interceptor of this.interceptors) {
      if (interceptor.response) {
        result = await interceptor.response(result);
      }
    }
    
    return result;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let result = error;
    
    for (const interceptor of this.interceptors) {
      if (interceptor.error) {
        result = await interceptor.error(result);
      }
    }
    
    return result;
  }

  /**
   * Make an HTTP request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout, enableFakeApi } = getConfig();  // eslint-disable-line @typescript-eslint/no-unused-vars
    const method = (options.method || 'GET') as HttpMethod;
    const { body, params, headers: customHeaders, ...rest } = options;

    // Build URL
    const url = buildUrl(endpoint, params);

    // Build headers
    const headers = {
      ...this.buildHeaders(),
      ...customHeaders,
    };

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
      ...rest,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET' && method !== 'HEAD') {
      requestOptions.body = JSON.stringify(body);
    }

    // Apply request interceptors
    const interceptedOptions = await this.applyRequestInterceptors({ ...options, headers: customHeaders });
    
    // Use fake API if enabled and available
    if (getUseFakeApi() && this.isFakeApiRoute(endpoint)) {
      return this.callFakeApi(endpoint, interceptedOptions);
    }

    // Make the actual request
    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers: { ...headers, ...interceptedOptions.headers },
      });

      // Check for errors
      if (!response.ok) {
        const error = await this.handleError(response);
        throw error;
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };

      // Apply response interceptors
      return this.applyResponseInterceptors(apiResponse);

    } catch (error) {
      // Convert error to ApiError format
      let processedError: ApiError;
      
      if (error && typeof error === 'object' && 'code' in error && 'status' in error && 'message' in error) {
        // Already an ApiError
        processedError = error as ApiError;
      } else {
        // Convert generic error to ApiError
        processedError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'NETWORK_ERROR',
          status: 0,
          data: error,
        };
      }
      
      const finalError = await this.applyErrorInterceptors(processedError);
      throw finalError;
    }
  }

  /**
   * Handle HTTP errors
   */
  private async handleError(response: Response): Promise<ApiError> {
    const status = response.status;
    const statusText = response.statusText;
    
    let message = statusText;
    let code = `HTTP_${status}`;
    let data: any = null;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        if (data.error_msg) {
          message = data.error_msg;
        }
        if (data.error_code) {
          code = data.error_code;
        }
      } else {
        const text = await response.text();
        if (text) {
          message = text;
        }
      }
    } catch {
      // Ignore parse errors
    }

    return {
      message,
      code,
      status,
      data,
    };
  }

  /**
   * Check if route should use fake API
   */
  private isFakeApiRoute(_endpoint: string): boolean {
    // Fake API is available for development
    return true;
  }

  /**
   * Call fake API (for development)
   */
  private async callFakeApi<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    // In development, the proxy setup should handle /api/* requests
    // But fakeApi uses different paths, so we need to remap
    const fakeEndpoint = this.mapToFakeApiEndpoint(endpoint);
    
    const headers = this.buildHeaders();
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    const url = `/fakeApi${fakeEndpoint}${this.buildQueryString(options.params)}`;
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    const data = await response.json();
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Map real API endpoint to fake API endpoint
   */
  private mapToFakeApiEndpoint(endpoint: string): string {
    // Convert /api/v1/... to /v1/...
    return endpoint.replace(/^\/api\/v1/, '');
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params?: Record<string, string | number | boolean>): string {
    if (!params) return '';
    
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.set(key, String(value));
      }
    }
    
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * HEAD request
   */
  async head(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<void>> {
    return this.request<void>(endpoint, { ...options, method: 'HEAD' });
  }

  /**
   * Unwrap backend response (extract data from {data, error_code, error_msg})
   */
  unwrapBackendResponse<T>(response: ApiResponse<BackendResponse<T>>): T {
    return unwrapResponse(response.data);
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new BaseApiClient();

/**
 * Create a new API client instance (useful for testing or multiple configurations)
 */
export function createApiClient(): BaseApiClient {
  return new BaseApiClient();
}

/**
 * Note: Token management methods (setTokens, clearTokens, etc.) are available
 * but not auto-loaded on import. Use hooks or manual setup for token management.
 */

export default apiClient;
