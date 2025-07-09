import { LensDebugPanel } from "@lens2/components/debug/lens-debug-panel";
import { FilterToolbar } from "@lens2/components/filters/filter-toolbar";
import { Toolbar } from "@lens2/components/toolbar/toolbar";
import { ErrorDisplay } from "@lens2/components/ui/error-display";
import { Loading } from "@lens2/components/ui/loading";
import { ViewConfiguration } from "@lens2/components/view-configuration/view-configuration";
import { ViewContainer } from "@lens2/components/views/view-container";
import {
  LensDataProps,
  LensProvider,
  useLensContext,
  ViewScoping,
} from "@lens2/contexts/lens-context";
import {
  LensDebugProvider,
  useLensDebugClient,
} from "@lens2/contexts/lens-debug-context";
import { ViewProvider } from "@lens2/contexts/view-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Component props extend the core data props
export interface LensProps extends LensDataProps {
  onError?: (error: Error) => void;
  enableDebug?: boolean;
  globalContext?: Record<string, any>;
  enableViews?: boolean;
  viewScoping?: ViewScoping;
}

function LensContent({ onError }: { onError?: (error: Error) => void }) {
  const { views, isLoading, error, setRecordsLoaded, enableViews } =
    useLensContext();
  const debugClient = useLensDebugClient();
  const [activeViewId, setActiveViewId] = useState<string>("");
  const viewContainerRef = useRef<HTMLDivElement>(null);

  // Get default view - there should always be at least one view
  const defaultView = views.find(v => v.is_default) || views[0];

  // Set initial active view when views are loaded
  useEffect(() => {
    if (!activeViewId && defaultView) {
      setActiveViewId(defaultView.id);
      debugClient.addLog("Activated default view", {
        viewId: defaultView.id,
        viewName: defaultView.name,
        viewType: defaultView.type,
        columnCount: defaultView.attributes?.length || 0,
      });
    }
  }, [activeViewId, defaultView]);

  // Enhanced view change handler with logging
  const handleViewChange = useCallback(
    (newViewId: string) => {
      const newView = views.find(v => v.id === newViewId);
      if (newView) {
        debugClient.addLog("Switched view", {
          fromViewId: activeViewId,
          toViewId: newView.id,
          viewName: newView.name,
          viewType: newView.type,
          columnCount: newView.attributes?.length || 0,
          hasFilters: !!newView.config?.filters,
          hasSorts: !!newView.config?.sorts?.length,
        });
        setActiveViewId(newViewId);
        // Reset records loaded when switching views
        setRecordsLoaded(0);
      }
    },
    [activeViewId, views, debugClient, setRecordsLoaded]
  );

  // Handle loading state
  if (isLoading) {
    return <Loading />;
  }

  // Handle error state
  if (error) {
    onError?.(error);
    return <ErrorDisplay error={error} />;
  }

  // Handle no views state (while creating default view)
  if (!views || views.length === 0) {
    return <Loading />;
  }

  // Find the active view
  const activeView = views.find(v => v.id === activeViewId) || defaultView;

  // Safety check - should not happen but just in case
  if (!activeView) {
    return <ErrorDisplay error={new Error("No views available")} />;
  }

  return (
    <div className="flex h-full flex-col">
      <ViewProvider view={activeView}>
        {enableViews && (
          <Toolbar
            activeViewId={activeViewId}
            onViewChange={handleViewChange}
          />
        )}
        <div
          ref={viewContainerRef}
          className="relative flex flex-1 flex-col overflow-hidden"
        >
          <FilterToolbar />
          <ViewContainer />
        </div>
        <ViewConfiguration containerRef={viewContainerRef} />
      </ViewProvider>
    </div>
  );
}

export function Lens({
  query,
  baseUrl,
  headers,
  onError,
  enableDebug = false,
  globalContext = {},
  enableViews = true,
  viewScoping,
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
        >
          <LensContent onError={onError} />
        </LensProvider>
        {enableDebug && <LensDebugPanel />}
      </LensDebugProvider>
    </QueryClientProvider>
  );
}
