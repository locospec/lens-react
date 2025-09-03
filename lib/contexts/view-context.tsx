import { mapFilterAttributes } from "@lens2/filters/logic/map-filter-attributes";
import {
  normalizeFilters,
  processFiltersForAPI,
} from "@lens2/filters/logic/process-filters";
import type { ReadRequestPayload } from "@lens2/types/api";
import type { Json, RowData } from "@lens2/types/common";
import type { ViewContextValue, ViewProviderProps } from "@lens2/types/context";
import type { Filter, FilterGroup } from "@lens2/types/filters";
import type { Sort } from "@lens2/types/view";
import * as logger from "@lens2/utils/logger";
import { convertSortsForAPI } from "@lens2/utils/sort-utils";
import type { Table } from "@tanstack/react-table";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLensViewContext } from "./lens-view-context";

const ViewContext = createContext<ViewContextValue | null>(null);

// Re-export types that are used by other components
export type { Attribute } from "@lens2/types/attributes";
export type { Sort, View, ViewConfig, ViewType } from "@lens2/types/view";

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
  const [filters, setFiltersState] = useState<Filter>(() => {
    const initial = initialView?.config?.filters || {};
    // Normalize filters to ensure consistent property order
    const normalized =
      Object.keys(initial).length > 0 ? normalizeFilters(initial) : initial;
    // console.log("Initial filters state:", {
    //   raw: initial,
    //   normalized,
    // });
    return normalized;
  });

  // Get API and globalContext from LensViewContext
  const { api, globalContext: lensGlobalContext } = useLensViewContext();
  const updateViewMutation = api.updateView();

  // Custom setFilters that ensures state updates and saves to config
  const setFilters = useCallback(
    (newFilters: Filter) => {
      logger.debug("setFilters called", { newFilters });

      // Check if this is an empty filter object (user cleared all filters)
      const isEmpty = Object.keys(newFilters).length === 0;

      // Process filters for API to get cleaned version
      const hasFilters = "op" in newFilters && "conditions" in newFilters;
      const processedFilters = hasFilters
        ? processFiltersForAPI(newFilters as FilterGroup)
        : null;

      logger.debug("Processed filters", { processedFilters, isEmpty });

      if (isEmpty) {
        // User explicitly cleared filters - this is valid
        logger.debug("Clearing filters");
        setFiltersState({});

        // For system views, don't persist to backend
        if (!view.isSystem) {
          // Save cleared filters to view configuration
          updateViewMutation
            .mutateAsync({
              id: view.id,
              config: {
                ...view.config,
                filters: undefined, // Remove filters from config
              },
            })
            .catch(error => {
              logger.error("Failed to clear filters in view config", error);
            });
        }
      } else if (processedFilters && processedFilters.conditions.length > 0) {
        // We have valid filters with conditions
        logger.debug("Setting filters state", { processedFilters });
        setFiltersState(processedFilters);

        // For system views, don't persist to backend
        if (!view.isSystem) {
          // Save cleaned filters to view configuration
          updateViewMutation
            .mutateAsync({
              id: view.id,
              config: {
                ...view.config,
                filters: processedFilters,
              },
            })
            .catch(error => {
              logger.error("Failed to save filters to view config", error);
            });
        }
      }
      // If filters are invalid (has op but no valid conditions), do nothing - keep existing filters
    },
    [updateViewMutation, view.id, view.config, view.isSystem]
  );
  const [sortsState, setSortsState] = useState<Sort[]>(
    initialView?.config?.sorts || []
  );

  // setSorts with backend persistence
  const setSorts = useCallback(
    (newSorts: Sort[]) => {
      logger.debug("setSorts called", { newSorts });

      // Update state immediately for instant UI feedback
      setSortsState(newSorts);

      // For system views, don't persist to backend
      if (!view.isSystem) {
        // Prepare sorts for saving - remove empty sorts array to keep config clean
        const sortsToSave = newSorts.length > 0 ? newSorts : undefined;

        // Save to backend in background
        updateViewMutation
          .mutateAsync({
            id: view.id,
            config: {
              ...view.config,
              sorts: sortsToSave,
            },
          })
          .catch(error => {
            logger.error("Failed to save sorts to view config", error);
          });
      }
    },
    [updateViewMutation, view.id, view.config, view.isSystem]
  );

  // Current sorts value
  const sorts = sortsState;

  // View configuration state
  const [configSheetOpen, setConfigSheetOpen] = useState(false);
  const [activeConfigPanel, setActiveConfigPanel] = useState("main");
  const [configChanges, setConfigChanges] = useState<Record<string, Json>>({});

  // Table instance state (for table views)
  const [table, setTable] = useState<Table<RowData> | null>(null);

  // Get views from LensViewContext
  const { views } = useLensViewContext();

  // Update view when views are refetched
  useEffect(() => {
    const updatedView = views.find(v => v.id === initialView.id);
    if (updatedView) {
      setView(updatedView);
    }
  }, [views, initialView.id]);

  // Log only on mount
  useEffect(() => {
    logger.debug("ViewProvider mounted", {
      viewId: initialView.id,
      hasFilters: !!initialView?.config?.filters,
      filters: initialView?.config?.filters,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only log on mount

  // Get attributes from LensViewContext
  const { attributes } = useLensViewContext();

  // Build the complete payload for _read endpoint
  const readPayload = useMemo(() => {
    // Build globalContext with search if search is not empty
    const contextWithSearch = search
      ? { ...lensGlobalContext, search }
      : lensGlobalContext;

    // console.log("readPayload", initialView.config, filters);

    // Process filters for API - removes empty conditions
    const hasFilters = "op" in filters && "conditions" in filters;
    const processedFilters = hasFilters
      ? processFiltersForAPI(filters as FilterGroup)
      : null;
    const hasValidFilters =
      processedFilters && processedFilters.conditions.length > 0;

    const payload: ReadRequestPayload = {
      globalContext: contextWithSearch || {},
    };

    // Include sorts if they exist - convert to backend format
    const activeSorts = sorts.length > 0 ? sorts : view.config?.sorts || [];
    if (activeSorts.length > 0) {
      payload.sorts = convertSortsForAPI(activeSorts);
    }

    // Only include filters if they have valid conditions
    if (hasValidFilters && processedFilters) {
      // Map filter attributes based on attribute configuration
      const mappedFilters = mapFilterAttributes(processedFilters, attributes);
      payload.filters = mappedFilters as FilterGroup;
    }

    return payload;
  }, [
    search,
    lensGlobalContext,
    filters,
    sorts,
    view.config?.sorts,
    attributes,
  ]);

  // Helper methods
  const clearFilters = useCallback(() => {
    setFilters({}); // This will now properly clear filters and update the view
  }, [setFilters]);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const resetView = useCallback(() => {
    setSearch("");
    setFilters(initialView?.config?.filters || {});
    setSorts(initialView?.config?.sorts || []);
    setConfigChanges({});
  }, [initialView, setFilters, setSorts]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<ViewContextValue>(
    () => ({
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
      clearFilters,
      clearSearch,
      resetView,
    }),
    [
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
      clearFilters,
      clearSearch,
      resetView,
    ]
  );

  return <ViewContext value={contextValue}>{children}</ViewContext>;
}

export const useViewContext = () => {
  const context = use(ViewContext);
  if (!context) {
    throw new Error("useViewContext must be used within ViewProvider");
  }
  return context;
};
