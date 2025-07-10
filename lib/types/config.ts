/**
 * Configuration types for Lens
 */

import type { Attribute } from "./attributes";

// Core Lens configuration
export interface Config {
  attributes: Record<string, Attribute>;
}

// Lens endpoints configuration
export interface LensEndpoints {
  // Data endpoints
  fetch_config: string;
  query: string;
  update_data: string;
  query_relation_options: string;

  // View endpoints
  list_views: string;
  create_view: string;
  update_view: string;
  delete_view: string;

  // Custom attributes endpoints
  list_custom_attributes: string;
  create_custom_attribute: string;
  update_custom_attribute: string;
  delete_custom_attribute: string;
}

// Core props needed by Lens
export interface LensDataProps {
  query: string;
  baseUrl: string;
  headers?: Record<string, string>;
}

// Column configuration
export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  resizable?: boolean;
}

// Table configuration
export interface TableConfig {
  rowHeight?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  stickyHeader?: boolean;
  virtualize?: boolean;
  selectable?: boolean;
}

// Layout configuration
export interface LayoutConfig {
  density?: "compact" | "normal" | "comfortable";
  showBorders?: boolean;
  striped?: boolean;
  highlightOnHover?: boolean;
}
