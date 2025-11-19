import {
  CACHE_TIME,
  REFETCH_OPTIONS,
  calculateStaleTime,
} from "@lens2/constants/cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LensFormProvider } from "./contexts/lens-form-context";
import { LensFormDebugProvider } from "./contexts/lens-form-debug-context";
import { LensFormDebugPanel } from "./debug/lens-form-debug-panel";
import { LensFormContent } from "./lens-form-content";
import type { LensFormProps } from "./types/form";
import { createLensViewPersister } from "./utils/create-lens-view-persister";
import * as logger from "./utils/logger";

export function LensForm({
  mutator,
  baseUrl,
  headers,
  onError,
  onSuccess,
  enableDebug = false,
  globalContext = {},
  cacheTime = CACHE_TIME.DEFAULT,
  enablePersistentCache = true,
  enableForceRefresh = false,
  onRefresh,
  rendererType = "shadcn",
  displayKeys,
  prefillMapping,
  defaultValues,
  autoCreateConfig,
  conditionalFields,
  dependencyMap,
  additionalFields,
  jsonFromOptions,
}: LensFormProps) {
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
    <LensFormDebugProvider enabled={enableDebug}>
      <LensFormProvider
        mutator={mutator}
        baseUrl={baseUrl}
        headers={headers}
        globalContext={globalContext}
        enableForceRefresh={enableForceRefresh}
        onForceRefresh={handleForceRefresh}
        rendererType={rendererType}
        displayKeys={displayKeys}
        prefillMapping={prefillMapping}
        defaultValues={defaultValues}
        autoCreateConfig={autoCreateConfig}
        conditionalFields={conditionalFields}
        dependencyMap={dependencyMap}
        additionalFields={additionalFields}
        jsonFromOptions={jsonFromOptions}
      >
        <LensFormContent onError={onError} onSuccess={onSuccess} />
      </LensFormProvider>
      {enableDebug && <LensFormDebugPanel />}
    </LensFormDebugProvider>
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
