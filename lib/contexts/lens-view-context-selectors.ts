import { useLensViewContext } from "./lens-view-context";

/**
 * Custom hooks for selective context subscriptions
 * These hooks help components subscribe only to the specific data they need
 */

// Hook that only subscribes to attributes
export function useLensViewAttributes() {
  const { attributes } = useLensViewContext();
  return attributes;
}

// Hook that only subscribes to API methods
export function useLensViewApi() {
  const { api } = useLensViewContext();
  return api;
}

// Hook that only subscribes to loading state
export function useLensViewLoading() {
  const { isLoading, error } = useLensViewContext();
  return { isLoading, error };
}

// Hook that only subscribes to views
export function useLensViewViews() {
  const { views, enableViews } = useLensViewContext();
  return { views, enableViews };
}

// Hook for global context management
export function useLensViewGlobalContext() {
  const { globalContext, setGlobalContext } = useLensViewContext();
  return { globalContext, setGlobalContext };
}

// Hook for record count
export function useLensViewRecordCount() {
  const { recordsLoaded, setRecordsLoaded } = useLensViewContext();
  return { recordsLoaded, setRecordsLoaded };
}
