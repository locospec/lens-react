/**
 * View-related types
 */

import type { Attribute } from "./attributes";
import type { Filter, FilterGroup } from "./filters";

// View types available in Lens
export type ViewType = "table" | "kanban" | "list" | "grid" | "raw";

// Sort direction
export type SortDirection = "asc" | "desc";

// Sort configuration
export interface Sort {
  field: string;
  direction: SortDirection;
}

// View configuration
export interface ViewConfig {
  visibleColumns?: string[];
  columnOrder?: string[];
  columnSizes?: Record<string, number>;
  filters?: FilterGroup;
  sorts?: Sort[];
}

// Complete view definition
export interface View {
  id: string;
  name: string;
  type: ViewType;
  description?: string | null;

  // Backend fields
  belongs_to_type?: string;
  belongs_to_value?: string;
  config?: ViewConfig;
  created_at?: string | null;
  updated_at?: string | null;

  // Display Configuration
  attributes?: Attribute[]; // Optional - only default view has attributes

  // Pagination - not persisted, just runtime
  perPage?: number;

  // View metadata
  is_default?: boolean;

  // View scoping fields
  scope_id?: string;
  user_id?: string;

  // System view indicator
  isSystem?: boolean;
}

// View scoping configuration
export interface ViewScoping {
  scopeId?: string;
  userId?: string;
}

// Configuration panel types
export type ConfigPanelType =
  | "main"
  | "columns"
  | "layout"
  | "filter"
  | "sort"
  | "group"
  | "settings";

// View state for runtime
export interface ViewState {
  search: string;
  filters: Filter;
  sorts: Sort[];
  selectedRows: Set<string>;
  page: number;
  cursor?: string | null;
}
