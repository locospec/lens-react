/**
 * API-related types for Lens
 */

import type { Attribute } from "./attributes";
import type { Json } from "./common";
import type { FilterGroup } from "./filters";
import type { SortDirection, View, ViewConfig } from "./view";

// Pagination configurations
export interface CursorPagination {
  type: "cursor";
  per_page: number;
  cursor: string | null;
}

export interface OffsetPagination {
  type: "offset";
  per_page: number;
  page: number;
}

export type Pagination = CursorPagination | OffsetPagination;

// API Request types
export interface ReadRequestPayload {
  globalContext: Json;
  filters?: FilterGroup;
  sorts?: Array<{ field: string; direction: SortDirection }>;
  pagination?: Pagination;
}

export interface UpdateRequestPayload {
  id: string | number;
  field: string;
  value: Json;
}

export interface CreateViewRequestPayload
  extends Omit<
    View,
    | "id"
    | "created_at"
    | "updated_at"
    | "is_default"
    | "attributes"
    | "perPage"
    | "description"
  > {
  config: ViewConfig; // Required for creation (not optional like in View)
}

export interface UpdateViewRequestPayload {
  id: string;
  name?: string;
  config?: Partial<ViewConfig>;
}

export interface DeleteViewRequestPayload {
  primary_key: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    cursor?: string;
    has_more?: boolean;
    total?: number;
    per_page?: number;
    current_page?: number;
  };
}

// Aggregate definition types
export interface AggregateGroupBy {
  source: string; // e.g., "city.district.state.uuid"
  name: string; // e.g., "state_id"
}

export interface AggregateColumn {
  function: string;
  name: string;
}

export interface AggregateDefinition {
  groupBy: AggregateGroupBy[];
  columns: AggregateColumn[];
}

export interface ConfigResponse {
  attributes: Record<string, Attribute>;
  aggregates?: Record<string, AggregateDefinition>;
}

export interface ViewsResponse {
  views: View[];
  defaultView?: View;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Custom attribute types
export interface CustomAttribute {
  id: string;
  query: string;
  name: string;
  label: string;
  type: string;
  options?: Array<{ label: string; value: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomAttributePayload {
  query: string;
  name: string;
  label: string;
  type: string;
  options?: Array<{ label: string; value: string }>;
}

export interface UpdateCustomAttributePayload {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface DeleteCustomAttributePayload {
  id: string;
}

// Relation options response
export interface RelationOption {
  value: string | number;
  label: string;
}

export interface RelationOptionsResponse {
  data: RelationOption[];
}
