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
  rendererType = "material",
}: LensFormProviderProps) {
  // Global context state
  const [globalContext, setGlobalContext] =
    useState<Record<string, Json>>(initialGlobalContext);

  // Form data state
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Debug client
  const debugClient = useLensFormDebugClient();

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
    return enrichFormAttributes(config.attributes, operation);
  }, [config]);

  // Generate schema and UI schema from enriched attributes
  const generatedSchema = useMemo(() => {
    if (!enrichedAttributes || Object.keys(enrichedAttributes).length === 0)
      return null;
    return generateJsonSchema(enrichedAttributes);
  }, [enrichedAttributes]);

  const generatedUiSchema = useMemo(() => {
    if (!enrichedAttributes || Object.keys(enrichedAttributes).length === 0)
      return null;
    return generateUiSchema(enrichedAttributes);
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
      enableForceRefresh,
      onForceRefresh,
      rendererType,
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
      enableForceRefresh,
      onForceRefresh,
      rendererType,
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
