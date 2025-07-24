import { LensProvider } from "@lens2/contexts/lens-context";
import { LensDebugProvider } from "@lens2/contexts/lens-debug-context";
import { LensDebugPanel } from "@lens2/debug/lens-debug-panel";
import { LensContent } from "@lens2/lens-content";
import type { LensProps } from "@lens2/types/lens";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createLensPersister } from "@lens2/utils/create-lens-persister";
import { CACHE_TIME, REFETCH_OPTIONS, calculateStaleTime } from "@lens2/constants/cache";
import { useMemo, useState, useCallback } from "react";

export function Lens({
  query,
  baseUrl,
  headers,
  onError,
  enableDebug = false,
  globalContext = {},
  enableViews = true,
  viewScoping,
  filterType = "advanced",
  interactions,
  cacheTime = CACHE_TIME.DEFAULT,
  enablePersistentCache = true,
  enableForceRefresh = false,
  onRefresh,
  initialViewId,
  onViewChange,
  displayAttributes,
  hideAttributes,
  systemViews,
}: LensProps) {
  // State to track if we should force refresh
  const [forceRefreshKey, setForceRefreshKey] = useState(0);

  // Create a new queryClient for each Lens instance
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
    () => (enablePersistentCache ? createLensPersister() : undefined),
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
    <LensDebugProvider enabled={enableDebug}>
      <LensProvider
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
        systemViews={systemViews}
      >
        <LensContent onError={onError} />
      </LensProvider>
      {enableDebug && <LensDebugPanel />}
    </LensDebugProvider>
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
    <QueryClientProvider client={queryClient}>
      {content}
    </QueryClientProvider>
  );
}
