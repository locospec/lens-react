import { useLensContext } from "./lens-context";

/**
 * Custom hooks for selective context subscriptions
 * These hooks help components subscribe only to the specific data they need
 */

// Hook that only subscribes to attributes
export function useLensAttributes() {
  const { attributes } = useLensContext();
  return attributes;
}

// Hook that only subscribes to API methods
export function useLensApi() {
  const { api } = useLensContext();
  return api;
}

// Hook that only subscribes to loading state
export function useLensLoading() {
  const { isLoading, error } = useLensContext();
  return { isLoading, error };
}

// Hook that only subscribes to views
export function useLensViews() {
  const { views, enableViews } = useLensContext();
  return { views, enableViews };
}

// Hook for global context management
export function useLensGlobalContext() {
  const { globalContext, setGlobalContext } = useLensContext();
  return { globalContext, setGlobalContext };
}

// Hook for record count
export function useLensRecordCount() {
  const { recordsLoaded, setRecordsLoaded } = useLensContext();
  return { recordsLoaded, setRecordsLoaded };
}
