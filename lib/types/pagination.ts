/**
 * Pagination types for Lens
 */

// Pagination type options
export type PaginationType = "cursor" | "offset";

// Cursor pagination meta (existing structure)
export interface CursorMeta {
  next_cursor?: string | null;
  prev_cursor?: string | null;
  has_more?: boolean;
  count?: number;
  per_page?: number;
  total?: number;
}

// Offset pagination meta (matching backend response)
export interface OffsetMeta {
  count: number; // Total number of records
  per_page: number; // Items per page
  current_page: number; // Current page number
  total_pages: number; // Total number of pages
  has_more: boolean; // Whether there are more pages
}

// Union type for pagination meta
export type PaginationMeta = CursorMeta | OffsetMeta;

// Paginated response interface
export interface PaginatedResponse<TMeta = PaginationMeta> {
  data: any[];
  meta?: TMeta;
  [key: string]: any;
}
