import { useLensContext } from "@lens2/contexts/lens-context";
import { useLensDebugClient } from "@lens2/contexts/lens-debug-context";
import { ViewProvider } from "@lens2/contexts/view-context";
import { FilterToolbar } from "@lens2/filters/filter-toolbar";
import { ViewsToolbar } from "@lens2/toolbar/views-toolbar";
import type { LensContentProps } from "@lens2/types/config";
import { ErrorDisplay } from "@lens2/ui/error-display";
import { Loading } from "@lens2/ui/loading";
import { ViewConfiguration } from "@lens2/view-configuration/view-configuration";
import { ViewContainer } from "@lens2/views/view-container";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function LensContent({ onError }: LensContentProps) {
  const {
    views,
    isLoading,
    error,
    setRecordsLoaded,
    enableViews,
    initialViewId,
    onViewChange,
  } = useLensContext();
  const debugClient = useLensDebugClient();
  const [activeViewId, setActiveViewId] = useState<string>(initialViewId || "");
  const viewContainerRef = useRef<HTMLDivElement>(null);

  // Get default view
  const defaultView = views.find(v => v.is_default);

  // Find the active view - memoized to prevent unnecessary re-renders
  const activeView = useMemo(
    () => views.find(v => v.id === activeViewId) || defaultView,
    [views, activeViewId, defaultView]
  );

  // Set initial active view when views are loaded (only on mount or when views change)
  useEffect(() => {
    if (views.length > 0 && !activeViewId) {
      // If initialViewId is provided and exists in views, use it
      if (initialViewId && views.find(v => v.id === initialViewId)) {
        setActiveViewId(initialViewId);
        const view = views.find(v => v.id === initialViewId)!;
        debugClient.addLog("Activated initial view", {
          viewId: view.id,
          viewName: view.name,
          viewType: view.type,
          columnCount: view.attributes?.length || 0,
        });
      } else if (defaultView) {
        // Otherwise use default view
        setActiveViewId(defaultView.id);
        debugClient.addLog("Activated default view", {
          viewId: defaultView.id,
          viewName: defaultView.name,
          viewType: defaultView.type,
          columnCount: defaultView.attributes?.length || 0,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [views]); // Only depend on views, not initialViewId

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
      } else {
        // View doesn't exist yet (might be newly created and still loading)
        debugClient.addLog("Switching to pending view", {
          fromViewId: activeViewId,
          toViewId: newViewId,
        });
      }

      // Always update the active view ID, even if the view doesn't exist yet
      setActiveViewId(newViewId);
      // Reset records loaded when switching views
      setRecordsLoaded(0);
      // Call the onViewChange callback if provided
      onViewChange?.(newViewId);
    },
    [activeViewId, views, debugClient, setRecordsLoaded, onViewChange]
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
    <div className="@container/lens-table flex h-full flex-col space-y-2">
      <ViewProvider key={activeView.id} view={activeView}>
        {enableViews && (
          <ViewsToolbar
            activeViewId={activeViewId}
            onViewChange={handleViewChange}
          />
        )}
        <FilterToolbar />
        <div
          ref={viewContainerRef}
          className="relative flex flex-1 flex-col overflow-hidden"
        >
          <ViewContainer />
        </div>
        <ViewConfiguration containerRef={viewContainerRef} />
      </ViewProvider>
    </div>
  );
}
