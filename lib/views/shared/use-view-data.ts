import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";

interface UseViewDataOptions {
  defaultPerPage?: number;
}

export function useViewData(options: UseViewDataOptions = {}) {
  const { config, endpoints, headers, query } = useLensContext();
  const { view, readPayload } = useViewContext();

  const { defaultPerPage = 5 } = options;

  // Get attributes directly from config
  const attributesObject = config?.attributes || {};
  const attributes = Object.values(attributesObject);

  // Infinite fetch for data
  const {
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    totalCount,
  } = useInfiniteFetch({
    query: query,
    viewId: view.id,
    endpoint: endpoints.query,
    headers: headers,
    perPage: view.perPage || defaultPerPage,
    body: readPayload,
  });

  return {
    // Config
    config,
    attributes,
    attributesObject,

    // Context
    endpoints,
    headers,
    query,
    view,
    readPayload,

    // Data
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    totalCount,
  };
}
