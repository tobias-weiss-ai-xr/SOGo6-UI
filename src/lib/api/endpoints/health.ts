/**
 * Health API Endpoints
 * All endpoints under /api/v1/health/*
 * Used for health checking and monitoring
 */

import { apiClient } from '../client/base-client';
import type { BackendResponse } from '../backend-response';

// ========== Types ==========

/**
 * Basic health check response
 */
export interface HealthCheck {
  status: 'ok' | 'degraded' | 'unhealthy' | 'critical';
  timestamp: string;
  version: string;
  service: string;
  checks: Array<{
    name: string;
    status: 'ok' | 'warning' | 'error' | 'skipped';
    message: string;
    duration_ms: number;
    details?: Record<string, any>;
  }>;
  overall_health: number; // 0-100
  uptime: number;
  uptime_human: string;
}

/**
 * Readiness check (for Kubernetes)
 */
export interface ReadinessCheck {
  ready: boolean;
  timestamp: string;
  message: string | null;
  dependencies: Record<string, boolean>;
}

/**
 * Liveness check (for Kubernetes)
 */
export interface LivenessCheck {
  alive: boolean;
  timestamp: string;
  message: string | null;
}

/**
 * Component health status
 */
export interface ComponentHealth {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  message: string;
  latency_ms: number | null;
  last_checked: string;
  last_error: string | null;
  checks: Array<{
    name: string;
    status: 'ok' | 'warning' | 'error';
    message: string;
    duration_ms: number;
  }>;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage_percent: number;
    load_average: [number, number, number]; // 1m, 5m, 15m
  };
  memory: {
    total_mb: number;
    used_mb: number;
    free_mb: number;
    usage_percent: number;
    rss_mb: number; // Process resident set
    heap_total_mb: number;
    heap_used_mb: number;
    external_mb: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    usage_percent: number;
    inodes_total: number;
    inodes_used: number;
    inodes_usage_percent: number;
  };
  network: {
    connections: number;
    rx_bytes: number;
    tx_bytes: number;
    rx_rate: number; // bytes per second
    tx_rate: number; // bytes per second
  };
  database: {
    connections: number;
    max_connections: number;
    connection_usage_percent: number;
    query_cache_hit_rate: number;
    slow_queries: number;
    last_query_time_ms: number;
    database_size_mb: number;
  };
  cache: {
    hit_rate: number;
    memory_used_mb: number;
    keys: number;
    evictions: number;
  };
  queue: {
    active_jobs: number;
    waiting_jobs: number;
    completed_jobs: number;
    failed_jobs: number;
    average_job_duration_ms: number;
  };
  mail: {
    inbound_queue: number;
    outbound_queue: number;
    last_delivery_time_ms: number | null;
    failed_deliveries: number;
  };
}

/**
 * ping response for simple health checks
 */
export interface PingResponse {
  pong: string;
  timestamp: number;
  uptime: number;
}

// ========== Health API Class ==========

/**
 * Health API Client
 * Handles health checking and monitoring endpoints
 */
export class HealthApi {
  /**
   * Perform a comprehensive health check
   */
  async check(): Promise<HealthCheck> {
    const response = await apiClient.get<BackendResponse<HealthCheck>>(
      '/api/v1/health'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Check specific components
   */
  async checkComponents(componentNames: string[]): Promise<ComponentHealth[]> {
    const response = await apiClient.get<BackendResponse<ComponentHealth[]>>(
      '/api/v1/health/components',
      { params: { components: componentNames.join(',') } }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get all component statuses
   */
  async checkAllComponents(): Promise<ComponentHealth[]> {
    const response = await apiClient.get<BackendResponse<ComponentHealth[]>>(
      '/api/v1/health/components'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Kubernetes readiness check
   * Returns 200 if ready, 503 if not ready
   */
  async readiness(): Promise<ReadinessCheck> {
    const response = await apiClient.get<BackendResponse<ReadinessCheck>>(
      '/api/v1/health/ready'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Kubernetes liveness check
   * Returns 200 if alive
   */
  async liveness(): Promise<LivenessCheck> {
    const response = await apiClient.get<BackendResponse<LivenessCheck>>(
      '/api/v1/health/live'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Simple ping check
   */
  async ping(): Promise<PingResponse> {
    const response = await apiClient.get<BackendResponse<PingResponse>>(
      '/api/v1/health/ping'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get<BackendResponse<SystemMetrics>>(
      '/api/v1/health/metrics'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get specific metric
   */
  async getMetric(metricName: string): Promise<Record<string, any>> {
    const response = await apiClient.get<BackendResponse<Record<string, any>>>(
      `/api/v1/health/metrics/${metricName}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<{
    status: 'ok' | 'error';
    message: string;
    latency_ms: number | null;
    connected_at: string | null;
    last_error: string | null;
    connection_count: number;
    max_connections: number;
  }> {
    const response = await apiClient.get<BackendResponse<{
      status: 'ok' | 'error';
      message: string;
      latency_ms: number | null;
      connected_at: string | null;
      last_error: string | null;
      connection_count: number;
      max_connections: number;
    }>>(
      '/api/v1/health/database'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Check cache connectivity
   */
  async checkCache(): Promise<{
    status: 'ok' | 'error';
    message: string;
    latency_ms: number | null;
    hit_rate: number;
    memory_used_mb: number;
    keys: number;
  }> {
    const response = await apiClient.get<BackendResponse<{
      status: 'ok' | 'error';
      message: string;
      latency_ms: number | null;
      hit_rate: number;
      memory_used_mb: number;
      keys: number;
    }>>(
      '/api/v1/health/cache'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Check external service connectivity
   */
  async checkExternalService(serviceName: string): Promise<{
    status: 'ok' | 'warning' | 'error';
    message: string;
    latency_ms: number | null;
    service: string;
    host: string | null;
    last_error: string | null;
    last_checked: string;
  }> {
    const response = await apiClient.get<BackendResponse<{
      status: 'ok' | 'warning' | 'error';
      message: string;
      latency_ms: number | null;
      service: string;
      host: string | null;
      last_error: string | null;
      last_checked: string;
    }>>(
      `/api/v1/health/service/${serviceName}`
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Run a specific health check by name
   */
  async runCheck(checkName: string): Promise<{
    name: string;
    status: 'ok' | 'warning' | 'error' | 'skipped';
    message: string;
    duration_ms: number;
    details: Record<string, any>;
  }> {
    const response = await apiClient.post<BackendResponse<{
      name: string;
      status: 'ok' | 'warning' | 'error' | 'skipped';
      message: string;
      duration_ms: number;
      details: Record<string, any>;
    }>>(
      '/api/v1/health/check',
      { check: checkName }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get health history
   */
  async getHistory(params: {
    limit?: number;
    start_time?: string;
    end_time?: string;
    status?: string;
    check?: string;
  } = {}): Promise<{
    history: Array<{
      id: string;
      check: string;
      status: string;
      message: string;
      duration_ms: number;
      timestamp: string;
      details: Record<string, any>;
    }>;
    total: number;
  }> {
    const response = await apiClient.get<BackendResponse<{
      history: Array<{
        id: string;
        check: string;
        status: string;
        message: string;
        duration_ms: number;
        timestamp: string;
        details: Record<string, any>;
      }>;
      total: number;
    }>>(
      '/api/v1/health/history',
      { params: params as unknown as Record<string, string> }
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Reset health check cache
   */
  async resetCache(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<BackendResponse<{ success: boolean; message: string }>>(
      '/api/v1/health/cache/reset'
    );
    return apiClient.unwrapBackendResponse(response);
  }

  /**
   * Get uptime information
   */
  async getUptime(): Promise<{
    uptime: number; // seconds
    uptime_human: string;
    start_time: string;
    last_restart: string | null;
    restarts: number;
    longest_uptime: number;
  }> {
    const response = await apiClient.get<BackendResponse<{
      uptime: number;
      uptime_human: string;
      start_time: string;
      last_restart: string | null;
      restarts: number;
      longest_uptime: number;
    }>>(
      '/api/v1/health/uptime'
    );
    return apiClient.unwrapBackendResponse(response);
  }
}

/**
 * Singleton Health API instance
 */
export const healthApi = new HealthApi();

export default healthApi;
