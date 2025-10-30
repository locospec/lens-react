/**
 * Form-specific types for LensForm
 */

import type { Json } from "./common";

// Mutator configuration from API
export interface MutatorConfig {
  name: string;
  label: string;
  type: "mutator";
  dbOp: "create" | "update" | "delete";
  model: string;
  attributes: Record<string, MutatorAttribute>;
  primaryKey: string;
}

// Mutator attribute definition
export interface MutatorAttribute {
  name: string;
  label: string;
  type: string;
  aliasKey: boolean;
  primaryKey: boolean;
  labelKey: boolean;
  deleteKey: boolean;
  transformKey: boolean;
  relatedModelName?: string;
  generators?: MutatorGenerator[];
  validators?: MutatorValidator[];
  options?: Array<
    { title: string; const: string } | { label: string; value: string }
  >;
  // Enriched form-specific properties
  validationRules?: Record<string, any>;
  operation?: "create" | "update";
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
}

// Mutator generator definition
export interface MutatorGenerator {
  id: string;
  type: string;
  source?: string | null;
  value?: string | null;
  operations: string[];
}

// Mutator validator definition
export interface MutatorValidator {
  id: string;
  type: string;
  message: string;
  operations: string[];
  value?: string | number; // For validators like min, max, min_length, max_length, pattern
}

// JSON Schema for forms
export interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface JsonSchemaProperty {
  type: string;
  format?: string;
  relatedModelName?: string;
  enum?: any[];
  items?: JsonSchemaProperty;
}

// UI Schema for forms
export interface UiSchema {
  type: string;
  elements?: UiSchemaElement[];
  options?: Record<string, any>;
}

export interface UiSchemaElement {
  type: string;
  scope: string;
  label: string;
  options?: Record<string, any>;
}

// Form configuration
export interface FormConfig {
  attributes: Record<string, MutatorAttribute>;
  schema: JsonSchema;
  uiSchema: UiSchema;
  primaryKey: string;
  dbOp: "create" | "update" | "delete";
  model: string;
}

// Form endpoints configuration
export interface FormEndpoints {
  fetch_config: string;
  baseEndpoint: string;
  query_relation_options: string;
}

// Core props needed by LensForm
export interface LensFormDataProps {
  mutator: string;
  baseUrl: string;
  headers?: Record<string, string>;
}

// Form renderer types
export type FormRendererType = "material" | "shadcn" | "custom";

// Form configuration
export interface LensFormConfiguration {
  globalContext?: Record<string, Json>;
  enableDebug?: boolean;
  enableForceRefresh?: boolean;
  onForceRefresh?: () => Promise<void>;
  onRefresh?: () => void;
  cacheTime?: number;
  enablePersistentCache?: boolean;
  rendererType?: FormRendererType;
  displayKeys?: Record<string, any>;
  prefillMapping?: Record<string, any>;
  defaultValues?: Record<string, any>;
  autoCreateConfig?: Record<string, any>;
  conditionalFields?: Record<string, any>;
  dependencyMap?: Record<string, any>;
}

// Main LensForm component props
export interface LensFormProps
  extends LensFormDataProps,
    LensFormConfiguration {
  onError?: (error: Error) => void;
  onSuccess?: (data: Record<string, any>) => void;
}

// LensFormContent component props
export interface LensFormContentProps {
  onError?: (error: Error) => void;
  onSuccess?: (data: Record<string, any>) => void;
}

// Form context value
export interface LensFormContextValue {
  mutator: string;
  baseUrl: string;
  endpoints: FormEndpoints;
  headers?: Record<string, string>;
  config: FormConfig | null;
  attributes: Record<string, MutatorAttribute>;
  api: any; // Will be typed when we create the API hook
  isLoading: boolean;
  error: Error | null;
  globalContext: Record<string, Json>;
  setGlobalContext: (context: Record<string, Json>) => void;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  enableForceRefresh: boolean;
  setRecordsLoaded: (count: number) => void;
  onForceRefresh?: () => Promise<void>;
  rendererType: FormRendererType;
  displayKeys?: Record<string, any>;
  prefillMapping?: Record<string, any>;
  defaultValues?: Record<string, any>;
  autoCreateConfig?: Record<string, any>;
  conditionalFields?: Record<string, any>;
  dependencyMap?: Record<string, any>;
  registerFieldRefetch: (
    fieldPath: string,
    refetchFn: (value: any) => void
  ) => void;
  unregisterFieldRefetch: (fieldPath: string) => void;
  triggerFieldRefetch: (fieldPath: string, value: any) => void;
}

// Form provider props
export interface LensFormProviderProps
  extends LensFormDataProps,
    LensFormConfiguration {
  children: React.ReactNode;
}
