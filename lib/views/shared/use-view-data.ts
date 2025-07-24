import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";

interface UseViewDataOptions {
  defaultPerPage?: number;
}

export function useViewData(options: UseViewDataOptions = {}) {
  const { config, endpoints, headers, query, attributes: enrichedAttributes } = useLensContext();
  const { view, readPayload } = useViewContext();

  const { defaultPerPage = 5 } = options;

  // Use enriched attributes from LensContext (which filters out unsupported types)
  const attributesObject = enrichedAttributes || {};
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
