import type { Table } from "@tanstack/react-table";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { processFiltersForAPI } from "../components/filters/utils/process-filters";
import type { Filter, FilterGroup } from "../types/filters";
import { useLensContext } from "./lens-context";

// View types
export type ViewType = "table" | "kanban" | "list" | "grid" | "raw";

export interface Attribute {
  name: string;
  label: string;
  type:
    | "string"
    | "number"
    | "decimal"
    | "boolean"
    | "date"
    | "datetime"
    | "text"
    | "longtext";
  primaryKey?: boolean;
}

export interface Sort {
  field: string;
  direction: "asc" | "desc";
}

export interface ViewConfig {
  visibleColumns?: string[];
  columnOrder?: string[];
  columnSizes?: Record<string, number>;
  filters?: FilterGroup;
  sorts?: Sort[];
}

export interface View {
  id: string;
  name: string;
  type: ViewType;
  description?: string | null;

  // Backend fields
  belongs_to_type: string;
  belongs_to_value: string;
  config?: ViewConfig;
  created_at?: string | null;
  updated_at?: string | null;

  // Display Configuration
  attributes?: Attribute[]; // Optional - only default view has attributes

  // Pagination - not persisted, just runtime
  perPage?: number;

  // View metadata
  is_default?: boolean;
}

interface ViewContextValue {
  view: View;
  readPayload: any; // The complete payload for _read endpoint
  search: string;
  setSearch: (search: string) => void;
  filters: Filter;
  setFilters: (filters: Filter) => void;
  sorts: Array<{ field: string; direction: "asc" | "desc" }>;
  setSorts: (
    sorts: Array<{ field: string; direction: "asc" | "desc" }>
  ) => void;
  // View configuration state
  configSheetOpen: boolean;
  setConfigSheetOpen: (open: boolean) => void;
  activeConfigPanel: string;
  setActiveConfigPanel: (panel: string) => void;
  configChanges: Record<string, any>;
  setConfigChanges: (changes: Record<string, any>) => void;
  // Table instance for table views
  table: Table<any> | null;
  setTable: (table: Table<any> | null) => void;
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

interface ViewProviderProps {
  view: View;
  children: React.ReactNode;
}

export function ViewProvider({
  view: initialView,
  children,
}: ViewProviderProps) {
  // Safety check - initialView should always be provided
  if (!initialView) {
    throw new Error("ViewProvider requires a view prop");
  }

  const [view, setView] = useState(initialView);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filter>(
    initialView?.config?.filters || {}
  );
  const [sorts, setSorts] = useState<
    Array<{ field: string; direction: "asc" | "desc" }>
  >(initialView?.config?.sorts || []);

  // View configuration state
  const [configSheetOpen, setConfigSheetOpen] = useState(false);
  const [activeConfigPanel, setActiveConfigPanel] = useState("main");
  const [configChanges, setConfigChanges] = useState<Record<string, any>>({});

  // Table instance state (for table views)
  const [table, setTable] = useState<Table<any> | null>(null);

  // Get globalContext from LensContext
  const { globalContext, views } = useLensContext();

  // Update view when views are refetched
  useEffect(() => {
    const updatedView = views.find(v => v.id === initialView.id);
    if (updatedView) {
      setView(updatedView);
      // Update filters if they've changed in the view config
      if (
        updatedView.config?.filters &&
        JSON.stringify(updatedView.config.filters) !== JSON.stringify(filters)
      ) {
        setFilters(updatedView.config.filters);
      }
    }
  }, [views, initialView.id]);

  // Build the complete payload for _read endpoint
  const readPayload = useMemo(() => {
    // Build globalContext with search if search is not empty
    const contextWithSearch = search
      ? { ...globalContext, search }
      : globalContext;

    // Process filters for API - removes empty conditions
    const hasFilters = "op" in filters && "conditions" in filters;
    const processedFilters = hasFilters
      ? processFiltersForAPI(filters as FilterGroup)
      : null;
    const hasValidFilters =
      processedFilters && processedFilters.conditions.length > 0;

    const payload: any = {
      globalContext: contextWithSearch,
      sorts: sorts.length > 0 ? sorts : view.config?.sorts || [],
    };

    // Only include filters if they have valid conditions
    if (hasValidFilters) {
      payload.filters = processedFilters;
    }

    return payload;
  }, [search, globalContext, filters, sorts, view.config?.sorts]);

  return (
    <ViewContext.Provider
      value={{
        view,
        readPayload,
        search,
        setSearch,
        filters,
        setFilters,
        sorts,
        setSorts,
        configSheetOpen,
        setConfigSheetOpen,
        activeConfigPanel,
        setActiveConfigPanel,
        configChanges,
        setConfigChanges,
        table,
        setTable,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useViewContext must be used within ViewProvider");
  }
  return context;
};
