import { useLensFormApi } from "@lens2/hooks/use-lens-form-api";
import type { Json } from "@lens2/types/common";
import type {
  FormEndpoints,
  LensFormContextValue,
  LensFormProviderProps,
} from "@lens2/types/form";
import { enrichFormAttributes } from "@lens2/utils/enrich-form-attributes";
import { createFormEndpoints } from "@lens2/utils/form-endpoints";
import * as logger from "@lens2/utils/logger";
import {
  generateJsonSchema,
  generateUiSchema,
} from "@lens2/utils/schema-generators";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLensFormDebugClient } from "./lens-form-debug-context";

const LensFormContext = createContext<LensFormContextValue | null>(null);

// Re-export types that are used by other components
export type { FormConfig } from "@lens2/types/form";

export function LensFormProvider({
  children,
  mutator,
  baseUrl,
  headers,
  globalContext: initialGlobalContext = {},
  enableForceRefresh = false,
  onForceRefresh,
  rendererType = "shadcn",
  displayKeys,
  prefillMapping,
  defaultValues,
  autoCreateConfig,
  conditionalFields,
  dependencyMap,
  additionalFields,
}: LensFormProviderProps) {
  // Global context state
  const [globalContext, setGlobalContext] =
    useState<Record<string, Json>>(initialGlobalContext);

  // Form data state - initialize with default values from schema
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Extract default values from schema if available
    if (defaultValues) {
      return { ...defaultValues };
    }
    return {};
  });

  // Debug client
  const debugClient = useLensFormDebugClient();

  // Records loaded state (for compatibility with useInfiniteFetch)
  const [recordsLoaded, setRecordsLoadedState] = useState(0);
  const setRecordsLoaded = useCallback(
    (count: number) => {
      setRecordsLoadedState(count);
      debugClient.setRecordsLoaded?.(count);
    },
    [debugClient]
  );

  // Field refetch registry for prefilled fields
  const fieldRefetchRegistry = useRef(new Map<string, (value: any) => void>());

  // Register field refetch function
  const registerFieldRefetch = useCallback(
    (fieldPath: string, refetchFn: (value: any) => void) => {
      fieldRefetchRegistry.current.set(fieldPath, refetchFn);
    },
    []
  );

  // Unregister field refetch function
  const unregisterFieldRefetch = useCallback((fieldPath: string) => {
    fieldRefetchRegistry.current.delete(fieldPath);
  }, []);

  // Trigger field refetch
  const triggerFieldRefetch = useCallback((fieldPath: string, value: any) => {
    const refetchFn = fieldRefetchRegistry.current.get(fieldPath);
    if (refetchFn) {
      console.log(
        `Triggering refetch for field: ${fieldPath} with value:`,
        value
      );
      refetchFn(value);
    } else {
      console.warn(`No refetch function registered for field: ${fieldPath}`);
    }
  }, []);

  // Create endpoints
  const endpoints = useMemo<FormEndpoints>(
    () => createFormEndpoints(baseUrl, mutator),
    [mutator, baseUrl]
  );

  // Create API instance
  const api = useLensFormApi({
    endpoints,
    headers,
    mutator,
  });

  // Fetch config
  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = api.config;

  // Log LensForm Provider initialization
  useEffect(() => {
    debugClient.addLog("Initialized LensForm Provider", { mutator, baseUrl });
    logger.info("LensForm Provider initialized", { mutator, baseUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Log config outcome
  const hasConfig = !!config;
  const hasConfigError = !!configError;

  useEffect(() => {
    if (!configLoading) {
      if (config) {
        const attributeCount = Object.keys(config.attributes || {}).length;
        debugClient.addLog("Fetched form configuration", {
          attributeCount,
          attributes: Object.keys(config.attributes || {}).slice(0, 5), // Show first 5 attributes
          hasMore: attributeCount > 5,
          dbOp: config.dbOp,
          model: config.model,
        });
      } else if (configError) {
        debugClient.addLog(
          "Failed to fetch form configuration",
          {
            error: configError.message,
            mutator,
          },
          "error"
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configLoading, hasConfig, hasConfigError]); // Intentionally exclude config, configError, debugClient, and mutator

  // Transform raw attributes into proper format and enrich them
  const enrichedAttributes = useMemo<Record<string, any>>(() => {
    if (!config?.attributes) return {};
    const operation =
      config?.dbOp === "delete" ? "update" : config?.dbOp || "create";
    const additional_fields: {} = additionalFields || {};
    const combinedAttributes = {
      ...config.attributes,
      ...additional_fields,
    };

    return enrichFormAttributes(combinedAttributes, operation);
  }, [config]);

  // Generate schema and UI schema from enriched attributes
  const generatedSchema = useMemo(() => {
    if (!enrichedAttributes || Object.keys(enrichedAttributes).length === 0)
      return null;
    return generateJsonSchema(
      enrichedAttributes,
      displayKeys,
      prefillMapping,
      defaultValues,
      autoCreateConfig,
      conditionalFields,
      dependencyMap
    );
  }, [enrichedAttributes]);

  const generatedUiSchema = useMemo(() => {
    if (!enrichedAttributes || Object.keys(enrichedAttributes).length === 0)
      return null;
    return generateUiSchema(
      enrichedAttributes,
      displayKeys,
      prefillMapping,
      defaultValues,
      autoCreateConfig,
      conditionalFields,
      dependencyMap
    );
  }, [enrichedAttributes]);

  // Use generated schemas with config
  const finalConfig = useMemo(() => {
    if (!config || !generatedSchema || !generatedUiSchema) return null;

    return {
      ...config,
      schema: generatedSchema,
      uiSchema: generatedUiSchema,
    };
  }, [config, generatedSchema, generatedUiSchema]);
  // Combine loading and error states
  const isLoading = configLoading;
  const configurationError =
    !isLoading && config && Object.keys(enrichedAttributes).length === 0
      ? new Error(
          "Configuration error: No attributes found. Please check your mutator configuration."
        )
      : null;
  const error = configError || configurationError;

  // Log configuration error if no attributes found
  useEffect(() => {
    if (configurationError) {
      debugClient.addLog(
        "Detected invalid form configuration",
        {
          error: "No attributes found",
          mutator,
        },
        "error"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!configurationError]); // Intentionally exclude configurationError, debugClient, and mutator

  // Handle form data changes
  const handleFormDataChange = useCallback((data: Record<string, any>) => {
    setFormData(data);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<LensFormContextValue>(
    () => ({
      mutator,
      baseUrl,
      endpoints,
      headers,
      config: finalConfig,
      attributes: enrichedAttributes,
      api,
      isLoading,
      error: error instanceof Error ? error : null,
      globalContext,
      setGlobalContext,
      formData,
      setFormData: handleFormDataChange,
      setRecordsLoaded,
      enableForceRefresh,
      onForceRefresh,
      rendererType,
      displayKeys,
      prefillMapping,
      defaultValues,
      autoCreateConfig,
      conditionalFields,
      dependencyMap,
      registerFieldRefetch,
      unregisterFieldRefetch,
      triggerFieldRefetch,
    }),
    [
      mutator,
      baseUrl,
      endpoints,
      headers,
      finalConfig,
      enrichedAttributes,
      api,
      isLoading,
      error,
      globalContext,
      setGlobalContext,
      formData,
      handleFormDataChange,
      setRecordsLoaded,
      enableForceRefresh,
      onForceRefresh,
      rendererType,
      displayKeys,
      prefillMapping,
      defaultValues,
      autoCreateConfig,
      conditionalFields,
      dependencyMap,
      registerFieldRefetch,
      unregisterFieldRefetch,
      triggerFieldRefetch,
    ]
  );

  return <LensFormContext value={contextValue}>{children}</LensFormContext>;
}

export const useLensFormContext = () => {
  const context = use(LensFormContext);
  if (!context) {
    throw new Error("useLensFormContext must be used within LensFormProvider");
  }
  return context;
};
