import { useLensContext } from "@lens2/contexts/lens-context";
import { useLensDebugClient } from "@lens2/contexts/lens-debug-context";
import { ViewProvider } from "@lens2/contexts/view-context";
import { FilterToolbar } from "@lens2/filters/filter-toolbar";
import { ViewsToolbar } from "@lens2/toolbar/views-toolbar";
import type { LensContentProps } from "@lens2/types/lens";
import { ErrorDisplay } from "@lens2/ui/error-display";
import { Loading } from "@lens2/ui/loading";
import { ViewConfiguration } from "@lens2/view-configuration/view-configuration";
import { ViewContainer } from "@lens2/views/view-container";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function LensContent({ onError }: LensContentProps) {
  const { views, isLoading, error, setRecordsLoaded, enableViews } =
    useLensContext();
  const debugClient = useLensDebugClient();
  const [activeViewId, setActiveViewId] = useState<string>("");
  const viewContainerRef = useRef<HTMLDivElement>(null);

  // Get default view - there should always be at least one view
  const defaultView = views.find(v => v.is_default) || views[0];

  // Find the active view - memoized to prevent unnecessary re-renders
  const activeView = useMemo(
    () => views.find(v => v.id === activeViewId) || defaultView,
    [views, activeViewId, defaultView]
  );

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
  }, [activeViewId, defaultView, debugClient]);

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

  // Safety check - should not happen but just in case
  if (!activeView) {
    return <ErrorDisplay error={new Error("No views available")} />;
  }

  return (
    <div className="@container/lens-table flex h-full flex-col">
      <ViewProvider key={activeView.id} view={activeView}>
        {enableViews && (
          <ViewsToolbar
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
