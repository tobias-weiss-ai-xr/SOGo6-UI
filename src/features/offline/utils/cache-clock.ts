/**
 * Cache timestamp utilities for offline data expiration.
 */

let _now = Date.now;

/**
 * Override the clock for deterministic tests.
 */
export function setCacheClock(fn: () => number): () => void {
  const prev = _now;
  _now = fn;
  return () => { _now = prev; };
}

/**
 * Return the current time suitable for cache TTL calculations.
 */
export function cacheClock(): number {
  return _now();
}

/**
 * Check if a cached item has expired based on its creation timestamp and TTL.
 */
export function isExpired(createdAt: number, ttlMs: number): boolean {
  return cacheClock() - createdAt > ttlMs;
}
