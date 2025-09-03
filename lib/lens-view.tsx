import {
  CACHE_TIME,
  REFETCH_OPTIONS,
  calculateStaleTime,
} from "@lens2/constants/cache";
import { LensViewProvider } from "@lens2/contexts/lens-view-context";
import { LensViewDebugProvider } from "@lens2/contexts/lens-view-debug-context";
import { LensViewDebugPanel } from "@lens2/debug/lens-view-debug-panel";
import { LensViewContent } from "@lens2/lens-view-content";
import type { LensViewProps } from "@lens2/types/config";
import { createLensViewPersister } from "@lens2/utils/create-lens-view-persister";
import * as logger from "@lens2/utils/logger";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useCallback, useEffect, useMemo, useState } from "react";

export function LensView({
  query,
  baseUrl,
  headers,
  onError,
  enableDebug = false,
  globalContext = {},
  enableViews = true,
  viewScoping,
  filterType = "nested",
  interactions,
  cacheTime = CACHE_TIME.DEFAULT,
  enablePersistentCache = true,
  enableForceRefresh = false,
  onRefresh,
  initialViewId,
  onViewChange,
  displayAttributes,
  hideAttributes,
  nonSortableAttributes,
  systemViews,
  perPage,
  paginationType,
  selectionType = "none",
  defaultSelected,
  onSelect,
}: LensViewProps) {
  // State to track if we should force refresh
  const [forceRefreshKey, setForceRefreshKey] = useState(0);

  // Enable/disable logger based on enableDebug prop
  useEffect(() => {
    if (enableDebug) {
      logger.enable();
      logger.setLevel("DEBUG");
    } else {
      logger.disable();
    }
  }, [enableDebug]);

  // Create a new queryClient for each LensView instance
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: REFETCH_OPTIONS.ON_WINDOW_FOCUS,
            retry: REFETCH_OPTIONS.RETRY,
            gcTime: cacheTime, // Use configurable cache time
            staleTime: calculateStaleTime(cacheTime),
          },
        },
      }),
    [cacheTime]
  );

  // Create persister (only if persistence is enabled)
  const persister = useMemo(
    () => (enablePersistentCache ? createLensViewPersister() : undefined),
    [enablePersistentCache]
  );

  // Handle force refresh
  const handleForceRefresh = useCallback(async () => {
    if (persister) {
      // Clear persisted cache
      await persister.removeClient();
    }
    // Clear memory cache
    queryClient.clear();
    // Invalidate all queries to trigger refetch
    await queryClient.invalidateQueries();
    // Update key to force re-render
    setForceRefreshKey(prev => prev + 1);
    // Call user callback
    onRefresh?.();
  }, [queryClient, persister, onRefresh]);

  // Render with appropriate provider based on persistence settings
  const content = (
    <LensViewDebugProvider enabled={enableDebug}>
      <LensViewProvider
        query={query}
        baseUrl={baseUrl}
        headers={headers}
        globalContext={globalContext}
        enableViews={enableViews}
        viewScoping={viewScoping}
        filterType={filterType}
        interactions={interactions}
        enableForceRefresh={enableForceRefresh}
        onForceRefresh={handleForceRefresh}
        initialViewId={initialViewId}
        onViewChange={onViewChange}
        displayAttributes={displayAttributes}
        hideAttributes={hideAttributes}
        nonSortableAttributes={nonSortableAttributes}
        systemViews={systemViews}
        perPage={perPage}
        paginationType={paginationType}
        selectionType={selectionType}
        defaultSelected={defaultSelected}
        onSelect={onSelect}
      >
        <LensViewContent onError={onError} />
      </LensViewProvider>
      {enableDebug && <LensViewDebugPanel />}
    </LensViewDebugProvider>
  );

  if (enablePersistentCache && persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: cacheTime,
          buster: String(forceRefreshKey),
        }}
      >
        {content}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
  );
}
