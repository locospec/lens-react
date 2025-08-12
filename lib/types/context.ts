/**
 * Context-specific types for Lens
 */

import type { useLensApi } from "@lens2/hooks/use-lens-api";
import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { AggregateDefinition, ReadRequestPayload } from "./api";
import type { Attribute, DisplayAttribute } from "./attributes";
import type { Json, RowData } from "./common";
import type { Config, LensDataProps, LensEndpoints } from "./config";
import type { Filter } from "./filters";
import type { FilterType } from "./lens";
import type { Sort, View, ViewScoping } from "./view";
import type { EntityInteractions } from "./interactions";

// Lens Context Value
export interface LensContextValue {
  query: string;
  baseUrl: string;
  endpoints: LensEndpoints;
  headers?: Record<string, string>;
  config: Config | null;
  attributes: Record<string, Attribute>;
  aggregates: Record<string, AggregateDefinition>;
  views: View[];
  api: ReturnType<typeof useLensApi>;
  isLoading: boolean;
  error: Error | null;
  globalContext: Record<string, Json>;
  setGlobalContext: (context: Record<string, Json>) => void;
  recordsLoaded: number;
  setRecordsLoaded: (count: number) => void;
  enableViews: boolean;
  viewScoping?: ViewScoping;
  filterType: FilterType;
  interactions?: EntityInteractions;
  // Force refresh functionality
  enableForceRefresh?: boolean;
  onForceRefresh?: () => Promise<void>;
  // View configuration
  initialViewId?: string;
  onViewChange?: (viewId: string) => void;
  // Attribute display configuration
  displayAttributes?: DisplayAttribute[];
  hideAttributes?: string[];
  // System views
  systemViews?: View[];
  // Pagination configuration
  perPage?: number;
  selectionType?: "none" | "single" | "multiple";
  defaultSelected?: string[];
  onSelect?: React.Dispatch<React.SetStateAction<string[]>>;
  selectionKey?: string;
}

// Lens Provider Props
export interface LensProviderProps extends LensDataProps {
  children: ReactNode;
  globalContext?: Record<string, Json>;
  enableViews?: boolean;
  viewScoping?: ViewScoping;
  filterType?: FilterType;
  interactions?: EntityInteractions;
  // Force refresh functionality
  enableForceRefresh?: boolean;
  onForceRefresh?: () => Promise<void>;
  // View configuration
  initialViewId?: string;
  onViewChange?: (viewId: string) => void;
  // Attribute display configuration
  displayAttributes?: DisplayAttribute[];
  hideAttributes?: string[];
  // System views
  systemViews?: View[];
  // Pagination configuration
  perPage?: number;
  // Selection Configuration
  selectionType?: "none" | "single" | "multiple";
  defaultSelected?: string[];
  onSelect?: React.Dispatch<React.SetStateAction<string[]>>;
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
