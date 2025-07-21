import { useViewContext } from "./view-context";

/**
 * Custom hooks for selective view context subscriptions
 * These prevent components from re-rendering when unrelated context values change
 */

// Hook for search functionality only
export function useViewSearch() {
  const { search, setSearch, clearSearch } = useViewContext();
  return { search, setSearch, clearSearch };
}

// Hook for filter management only
export function useViewFilters() {
  const { filters, setFilters, clearFilters } = useViewContext();
  return { filters, setFilters, clearFilters };
}

// Hook for sorting only
export function useViewSorts() {
  const { sorts, setSorts } = useViewContext();
  return { sorts, setSorts };
}

// Hook for configuration sheet state
export function useViewConfigSheet() {
  const {
    configSheetOpen,
    setConfigSheetOpen,
    activeConfigPanel,
    setActiveConfigPanel,
    configChanges,
    setConfigChanges,
  } = useViewContext();

  return {
    configSheetOpen,
    setConfigSheetOpen,
    activeConfigPanel,
    setActiveConfigPanel,
    configChanges,
    setConfigChanges,
  };
}

// Hook for table instance (for table views)
export function useViewTable() {
  const { table, setTable } = useViewContext();
  return { table, setTable };
}

// Hook for read payload (commonly needed for data fetching)
export function useViewReadPayload() {
  const { readPayload } = useViewContext();
  return readPayload;
}
