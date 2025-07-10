/**
 * Shared View Configuration Constants
 */

// Column Sizing
export const COLUMN_SIZES = {
  DEFAULT: 150,
  MIN: 50,
  MAX: 500,
} as const;

// Row Configuration
export const ROW_CONFIG = {
  ESTIMATED_HEIGHT: 48, // Estimated height of each row in pixels
  OVERSCAN_COUNT: 5, // Number of rows to render outside viewport
} as const;

// Loading States
export const LOADING_CONFIG = {
  INDICATOR_HEIGHT: 50, // Height of the loading indicator in pixels
} as const;

// Data Fetching
export const FETCH_CONFIG = {
  DEFAULT_PER_PAGE: 5, // Number of items to fetch per page
} as const;
