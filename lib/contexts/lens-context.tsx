import { useLensDebugClient } from "@lens2/contexts/lens-debug-context";
import type { Attribute, View } from "@lens2/contexts/view-context";
import { useLensApi } from "@lens2/hooks/use-lens-api";
import { createEndpoints, LensEndpoints } from "@lens2/utils/endpoints";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// View scoping configuration
export interface ViewScoping {
  tenantId?: string;
  userId?: string;
}

export interface Config {
  attributes: Record<string, Attribute>;
}

// Core props needed by the provider
export interface LensDataProps {
  query: string;
  baseUrl: string;
  headers?: Record<string, string>;
}

interface LensContextValue {
  query: string;
  baseUrl: string;
  endpoints: LensEndpoints;
  headers?: Record<string, string>;
  config: Config | null;
  views: View[];
  api: ReturnType<typeof useLensApi>;
  isLoading: boolean;
  error: Error | null;
  globalContext: Record<string, any>;
  setGlobalContext: (context: Record<string, any>) => void;
  recordsLoaded: number;
  setRecordsLoaded: (count: number) => void;
  enableViews: boolean;
  viewScoping?: ViewScoping;
}

const LensContext = createContext<LensContextValue | undefined>(undefined);

interface LensProviderProps extends LensDataProps {
  children: React.ReactNode;
  globalContext?: Record<string, any>;
  enableViews?: boolean;
  viewScoping?: ViewScoping;
}

export function LensProvider({
  children,
  query,
  baseUrl,
  headers,
  globalContext: initialGlobalContext = {},
  enableViews = true,
  viewScoping,
}: LensProviderProps) {
  // Global context state
  const [globalContext, setGlobalContext] =
    useState<Record<string, any>>(initialGlobalContext);
  const [recordsLoaded, setRecordsLoadedState] = useState(0);

  // Debug client
  const debugClient = useLensDebugClient();

  // Wrapper function to update both local state and debug provider
  const setRecordsLoaded = useCallback(
    (count: number) => {
      setRecordsLoadedState(count);
      debugClient.setRecordsLoaded(count);
    },
    [debugClient]
  );

  // Create endpoints
  const endpoints = useMemo<LensEndpoints>(
    () => createEndpoints(query, baseUrl),
    [query, baseUrl]
  );

  // Create API instance
  const api = useLensApi({
    endpoints,
    headers,
    query,
    enableViews,
    viewScoping,
  });

  // Fetch config and views
  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = api.config();
  const {
    data: viewsData,
    isLoading: viewsLoading,
    error: viewsError,
    refetch: refetchViews,
  } = api.views();

  // Create view mutation
  const createViewMutation = api.createView();

  // Log Lens Provider initialization
  useEffect(() => {
    debugClient.addLog("Initialized Lens Provider", { query, baseUrl });
  }, []); // Only on mount

  // Log config outcome
  useEffect(() => {
    if (!configLoading) {
      if (config) {
        const attributeCount = Object.keys(config.attributes || {}).length;
        debugClient.addLog("Fetched configuration", {
          attributeCount,
          attributes: Object.keys(config.attributes || {}).slice(0, 5), // Show first 5 attributes
          hasMore: attributeCount > 5,
        });
      } else if (configError) {
        debugClient.addLog(
          "Failed to fetch configuration",
          {
            error: configError.message,
            query,
          },
          "error"
        );
      }
    }
  }, [configLoading, !!config, !!configError]);

  // Log views outcome and create default view if needed
  useEffect(() => {
    if (!viewsLoading && viewsData) {
      const viewCount = viewsData.views?.length || 0;

      // If no views exist and views are enabled, create a default view
      if (viewCount === 0 && !createViewMutation.isPending && enableViews) {
        debugClient.addLog("No views found, creating default view", { query });

        const viewPayload: any = {
          name: "Default View",
          type: "table",
          is_default: true,
          belongs_to_type: "query",
          belongs_to_value: query,
          config: {},
        };

        // Add tenant_id and user_id if provided via viewScoping
        if (viewScoping?.tenantId) {
          viewPayload.tenant_id = viewScoping.tenantId;
        }
        if (viewScoping?.userId) {
          viewPayload.user_id = viewScoping.userId;
        }

        createViewMutation.mutate(viewPayload, {
          onSuccess: () => {
            debugClient.addLog("Successfully created default view");
            refetchViews();
          },
          onError: error => {
            debugClient.addLog(
              "Failed to create default view",
              { error: error.message },
              "error"
            );
          },
        });
      } else {
        debugClient.addLog("Fetched views", {
          viewCount,
          hasDefaultView: viewsData.views?.some((v: View) => v.is_default),
          viewNames: viewsData.views?.map((v: View) => v.name) || [],
        });
      }
    } else if (!viewsLoading && viewsError) {
      debugClient.addLog(
        "Failed to fetch views",
        {
          error: viewsError.message,
          query,
        },
        "error"
      );
    }
  }, [
    viewsLoading,
    viewsData,
    viewsError,
    query,
    createViewMutation.isPending,
    viewScoping,
    enableViews,
  ]);

  // Check for valid config and attributes
  const attributesArray: Attribute[] = config?.attributes
    ? Object.values(config.attributes)
    : [];

  // Combine loading and error states
  const isLoading =
    configLoading ||
    viewsLoading ||
    (enableViews && createViewMutation.isPending);
  const configurationError =
    !isLoading && config && attributesArray.length === 0
      ? new Error(
          "Configuration error: No attributes found. Please check your query configuration."
        )
      : null;
  const error = configError || viewsError || configurationError;

  // Log configuration error if no attributes found
  useEffect(() => {
    if (configurationError) {
      debugClient.addLog(
        "Detected invalid configuration",
        {
          error: "No attributes found",
          query,
        },
        "error"
      );
    }
  }, [!!configurationError]);

  // Get views from API - no need to create a fake default view
  const views: View[] = viewsData?.views || [];

  // Process views and ensure we always have at least one view
  const viewsWithAttributes = useMemo(() => {
    if (!views || views.length === 0) {
      // If no views exist yet, return empty array
      // The useEffect above will create a default view
      return [];
    }

    return views.map((view: any) => {
      const normalizedView: View = {
        ...view,
      };

      // Add attributes to default view
      if (view.is_default) {
        normalizedView.attributes = attributesArray;
      }

      return normalizedView;
    });
  }, [views, attributesArray]);

  return (
    <LensContext.Provider
      value={{
        query,
        baseUrl,
        endpoints,
        headers,
        config: config || null,
        views: viewsWithAttributes,
        api,
        isLoading,
        error: error instanceof Error ? error : null,
        globalContext,
        setGlobalContext,
        recordsLoaded,
        setRecordsLoaded,
        enableViews,
        viewScoping,
      }}
    >
      {children}
    </LensContext.Provider>
  );
}

export const useLensContext = () => {
  const context = useContext(LensContext);
  if (!context) {
    throw new Error("useLensContext must be used within LensProvider");
  }
  return context;
};
