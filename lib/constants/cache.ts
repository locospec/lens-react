/**
 * Cache configuration constants for React Query
 * All time values are in milliseconds
 */

// Base time units
const MINUTE = 60 * 1000;

// Cache duration (gcTime) - how long data stays in cache
export const CACHE_TIME = {
  DEFAULT: 30 * MINUTE, // Default cache time for all queries
} as const;

// Stale time - how long data is considered fresh
export const STALE_TIME = {
  // Config data changes rarely, keep fresh for longer
  CONFIG: 10 * MINUTE,

  // Views can change more frequently
  VIEWS: 5 * MINUTE,

  // Filter options (selected options hydration)
  FILTER_OPTIONS: 5 * MINUTE,

  // Paginated data should never auto-refetch
  INFINITE_DATA: Infinity,

  // For disabled features
  DISABLED_FEATURE: Infinity,
} as const;

// Refetch behavior
export const REFETCH_OPTIONS = {
  ON_WINDOW_FOCUS: false,
  ON_MOUNT: false,
  RETRY: 1,
} as const;

// Calculate dynamic stale time based on cache time
export const calculateStaleTime = (cacheTime: number): number => {
  // Use 5 minutes or 1/6 of cache time, whichever is smaller
  return Math.min(5 * MINUTE, cacheTime / 6);
};

// Persister configuration
export const PERSISTER_CONFIG = {
  DB_NAME: "lens-view-react-query-persistence",
  STORE_NAME: "lens-view-query-state",
  DB_VERSION: 1,
} as const;
