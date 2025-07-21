import { LensProvider } from "@lens2/contexts/lens-context";
import { LensDebugProvider } from "@lens2/contexts/lens-debug-context";
import { LensDebugPanel } from "@lens2/debug/lens-debug-panel";
import { LensContent } from "@lens2/lens-content";
import type { LensProps } from "@lens2/types/lens";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

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
}: LensProps) {
  // Create a new queryClient for each Lens instance
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LensDebugProvider enabled={enableDebug}>
        <LensProvider
          query={query}
          baseUrl={baseUrl}
          headers={headers}
          globalContext={globalContext}
          enableViews={enableViews}
          viewScoping={viewScoping}
          filterType={filterType}
        >
          <LensContent onError={onError} />
        </LensProvider>
        {enableDebug && <LensDebugPanel />}
      </LensDebugProvider>
    </QueryClientProvider>
  );
}
