/**
 * React Hooks for API Client
 * Provides automatic token management and configuration for Next.js
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../endpoints/auth';
import type { LoginRequest, LoginResponse } from '../endpoints/auth';

// apiClient is imported for module configuration but not directly used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { apiClient } from '../client/base-client';

/**
 * Token storage keys
 */
const JWT_TOKEN_KEY = 'NEXT_PUBLIC_JWT_STORAGE_KEY';
const REFRESH_TOKEN_KEY = 'NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY';

/**
 * User context from JWT token (decoded)
 */
export interface UserTokenContext {
  uid: string;
  username: string;
  email: string;
  display_name: string;
  roles: string[];
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token without verification (for client-side use)
 */
function decodeJwt(token: string): UserTokenContext | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string | null, bufferSeconds: number = 30): boolean {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return false;
  
  const expiresAt = decoded.exp * 1000;
  const now = Date.now();
  const buffer = bufferSeconds * 1000;
  
  return expiresAt - buffer < now;
}

/**
 * Get token from storage
 */
function getTokenFromStorage(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(JWT_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get refresh token from storage
 */
function getRefreshTokenFromStorage(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store tokens in storage
 */
function storeTokensInStorage(jwtToken: string, refreshToken: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(JWT_TOKEN_KEY, jwtToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {
      console.warn('Could not store tokens in localStorage:', e);
    }
  }
}

/**
 * Remove tokens from storage
 */
function removeTokensFromStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(JWT_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.warn('Could not clear tokens from localStorage:', e);
    }
  }
}

/**
 * Return type for useApi hook
 */
export interface UseApiResult {
  user: UserTokenContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: (deviceId?: string) => Promise<void>;
  ensureValidToken: () => Promise<boolean>;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  clearTokens: () => void;
}

/**
 * Hook to manage API client configuration and token state
 */
export function useApi(): UseApiResult {
  const [user, setUser] = useState<UserTokenContext | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize from storage
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setError(null);
        
        const jwtToken = getTokenFromStorage();
        const userContext = safeDecodeJwt(jwtToken);
        
        setUser(userContext);
        setIsAuthenticated(!!jwtToken && !isTokenExpired(jwtToken));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Initialization error'));
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
  }, []);
  
  // Helper to safely decode JWT
  function safeDecodeJwt(token: string | null): UserTokenContext | null {
    if (!token) return null;
    return decodeJwt(token);
  }

  /**
   * Login and store tokens
   */
  const login = useCallback(async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: LoginResponse = await authApi.login(data);
      
      // Store tokens
      storeTokensInStorage(response.jwt_token, response.refresh_token);
      
      // Update state
      const userContext = decodeJwt(response.jwt_token);
      setUser(userContext);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      setIsAuthenticated(false);
      setIsLoading(false);
      throw err;
    }
  }, []);
  
  /**
   * Logout and clear tokens
   */
  const logout = useCallback(async (deviceId?: string) => {
    try {
      setIsLoading(true);
      
      const jwtToken = getTokenFromStorage();
      if (jwtToken) {
        try {
          await authApi.logout(deviceId);
        } catch {
          // Ignore errors during logout
        }
      }
      
      removeTokensFromStorage();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Get current JWT token
   */
  const getToken = useCallback((): string | null => {
    const token = getTokenFromStorage();
    if (token && !isTokenExpired(token)) {
      return token;
    }
    return null;
  }, []);
  
  /**
   * Get current refresh token
   */
  const getRefreshToken = useCallback((): string | null => {
    return getRefreshTokenFromStorage();
  }, []);
  
  /**
   * Ensure we have a valid token, refresh if needed
   */
  const ensureValidToken = useCallback(async (): Promise<boolean> => {
    const token = getTokenFromStorage();
    
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }
    
    if (isTokenExpired(token)) {
      const refreshToken = getRefreshTokenFromStorage();
      if (!refreshToken) {
        removeTokensFromStorage();
        setIsAuthenticated(false);
        return false;
      }
      
      try {
        const response: LoginResponse = await authApi.refreshToken(refreshToken);
        storeTokensInStorage(response.jwt_token, response.refresh_token);
        const userContext = decodeJwt(response.jwt_token);
        setUser(userContext);
        setIsAuthenticated(true);
        return true;
      } catch {
        removeTokensFromStorage();
        setIsAuthenticated(false);
        return false;
      }
    }
    
    return true;
  }, []);
  
  /**
   * Clear all tokens and reset state
   */
  const clearTokens = useCallback(() => {
    removeTokensFromStorage();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    ensureValidToken,
    getToken,
    getRefreshToken,
    clearTokens,
  };
}

/**
 * Type alias for useApi return value
 */
export type ApiContextType = UseApiResult;

export default useApi;
