import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";
import { FETCH_CONFIG } from "./constants";

interface UseViewDataOptions {
  defaultPerPage?: number;
}

export function useViewData(options: UseViewDataOptions = {}) {
  const {
    config,
    endpoints,
    headers,
    query,
    attributes: enrichedAttributes,
    perPage: contextPerPage,
    paginationType,
  } = useLensContext();
  const { view, readPayload } = useViewContext();

  const { defaultPerPage = FETCH_CONFIG.DEFAULT_PER_PAGE } = options;

  // Calculate the actual perPage value being used
  const actualPerPage = view.perPage || contextPerPage || defaultPerPage;

  // Use enriched attributes from LensContext (which filters out unsupported types)
  const attributesObject = enrichedAttributes || {};
  const attributes = Object.values(attributesObject);

  // Infinite fetch for data
  const {
    flatData,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
  } = useInfiniteFetch({
    query: query,
    viewId: view.id,
    endpoint: endpoints.query,
    headers: headers,
    perPage: actualPerPage,
    paginationType: paginationType,
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
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
    perPage: actualPerPage,
  };
}
