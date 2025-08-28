/**
 * Context-specific types for Lens
 */

import type { useLensApi } from "@lens2/hooks/use-lens-api";
import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { AggregateDefinition, ReadRequestPayload } from "./api";
import type { Attribute, AttributeDisplayConfiguration } from "./attributes";
import type { Json, RowData } from "./common";
import type {
  Config,
  LensConfiguration,
  LensDataProps,
  LensEndpoints,
} from "./config";
import type { Filter, FilterType } from "./filters";
import type { SelectionConfiguration } from "./interactions";
import type { Sort, View, ViewConfiguration } from "./view";

/**
 * Lens Context Value extends all configurations plus core runtime data
 *
 * This interface combines:
 * - Configuration properties (from various Configuration interfaces) - user settings and preferences
 * - Runtime state properties (defined below) - live data and API state
 */
export interface LensContextValue
  extends LensConfiguration,
    ViewConfiguration,
    AttributeDisplayConfiguration,
    SelectionConfiguration {
  // === CORE API PROPERTIES ===
  // Connection and API configuration
  query: string;
  baseUrl: string;
  endpoints: LensEndpoints;
  headers?: Record<string, string>;
  api: ReturnType<typeof useLensApi>;

  // === RUNTIME STATE - LOADED DATA ===
  // Configuration and schema loaded from server
  config: Config | null;
  attributes: Record<string, Attribute>;
  filterableAttributes: Record<string, Attribute>;
  searchableAttributes: Record<string, Attribute>;
  aggregates: Record<string, AggregateDefinition>;
  views: View[]; // List of available views fetched from API

  // === RUNTIME STATE - REQUEST STATUS ===
  // Loading and error states
  isLoading: boolean;
  error: Error | null;
  recordsLoaded: number;

  // === CONFIGURATION OVERRIDES ===
  // Properties that are optional in config but required at runtime (resolved with defaults)
  enableViews: boolean; // Resolved from ViewConfiguration.enableViews (optional, default: true)
  filterType: FilterType; // Resolved from filter configuration (optional, default: "nested")

  // === STATE MANAGEMENT FUNCTIONS ===
  // Context manipulation functions
  setGlobalContext: (context: Record<string, Json>) => void;
  setRecordsLoaded: (count: number) => void;
}

// Lens Provider Props
export interface LensProviderProps
  extends LensDataProps,
    LensConfiguration,
    ViewConfiguration,
    AttributeDisplayConfiguration,
    SelectionConfiguration {
  children: ReactNode;
}

// View Context Value
export interface ViewContextValue {
  view: View;
  readPayload: ReadRequestPayload;
  search: string;
  setSearch: (search: string) => void;
  filters: Filter;
  setFilters: (filters: Filter) => void;
  sorts: Sort[];
  setSorts: (sorts: Sort[]) => void;
  // View configuration state
  configSheetOpen: boolean;
  setConfigSheetOpen: (open: boolean) => void;
  activeConfigPanel: string;
  setActiveConfigPanel: (panel: string) => void;
  configChanges: Record<string, Json>;
  setConfigChanges: (changes: Record<string, Json>) => void;
  // Table instance for table views
  table: Table<RowData> | null;
  setTable: (table: Table<RowData> | null) => void;
  // Additional helper methods
  clearFilters: () => void;
  clearSearch: () => void;
  resetView: () => void;
}

// View Provider Props
export interface ViewProviderProps {
  view: View;
  children: ReactNode;
}

// Debug Context Value
export interface DebugContextValue {
  enabled: boolean;
  logs: DebugLog[];
  addLog: (log: Omit<DebugLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
  apiCalls: ApiCall[];
  addApiCall: (call: Omit<ApiCall, "id" | "startTime">) => string;
  updateApiCall: (id: string, updates: Partial<ApiCall>) => void;
  recordsLoaded: number;
  setRecordsLoaded: (count: number) => void;
}

// Debug types
export interface DebugLog {
  id: string;
  timestamp: number;
  type: "info" | "warn" | "error";
  message: string;
  data?: Json;
}

export interface ApiCall {
  id: string;
  method: string;
  endpoint: string;
  request?: Json;
  response?: Json;
  status?: number;
  duration?: number;
  startTime: number;
  error?: string;
}
