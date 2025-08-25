/**
 * Configuration types for Lens
 */

import type { AggregateDefinition } from "./api";
import type { Attribute, AttributeDisplayConfiguration } from "./attributes";
import type { Json } from "./common";
import type { FilterType } from "./filters";
import type { SelectionConfiguration } from "./interactions";
import type { ViewConfiguration } from "./view";

// Core Lens configuration
export interface Config {
  attributes: Record<string, Attribute>;
  aggregates?: Record<string, AggregateDefinition>;
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

/**
 * Cache and refresh configuration
 */
export interface CacheConfiguration {
  cacheTime?: number;
  enablePersistentCache?: boolean;
  enableForceRefresh?: boolean;
  onForceRefresh?: () => Promise<void>;
  onRefresh?: () => void;
}

/**
 * Core lens behavior configuration
 */
export interface CoreLensConfiguration {
  globalContext?: Record<string, Json>;
  perPage?: number;
  filterType?: FilterType;
}

/**
 * Base lens configuration - core settings that belong in config.ts
 *
 * This includes:
 * - CoreLensConfiguration (globalContext, perPage, filterType)
 * - CacheConfiguration (cache settings, refresh callbacks)
 *
 * NOTE: This is NOT the complete configuration. Other domain-specific configs
 * are defined in their respective files and composed in LensProps/LensProviderProps
 */
export interface LensConfiguration
  extends CacheConfiguration,
    CoreLensConfiguration {}

// === COMPONENT INTERFACES ===

/**
 * Main Lens component props - combines all configuration interfaces
 *
 * Available props include (among others):
 * - query: string (required)
 * - baseUrl: string (required)
 * - filterType?: "advanced" | "chip"
 * - enableViews?: boolean
 * - globalContext?: Record<string, Json>
 * - selectionType?: "none" | "single" | "multiple"
 */
export interface LensProps
  extends LensDataProps,
    LensConfiguration,
    ViewConfiguration,
    AttributeDisplayConfiguration,
    SelectionConfiguration {
  // Component-specific props (not shared config)
  onError?: (error: Error) => void;
  enableDebug?: boolean;
}

// LensContent component props
export interface LensContentProps {
  onError?: (error: Error) => void;
}
