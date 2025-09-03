import { REFETCH_OPTIONS, STALE_TIME } from "@lens2/constants/cache";
import { useLensViewContext } from "@lens2/contexts/lens-view-context";
import { useLensViewDebugClient } from "@lens2/contexts/lens-view-debug-context";
import type {
  CursorMeta,
  OffsetMeta,
  PaginatedResponse,
  PaginationType,
} from "@lens2/types/pagination";
import * as logger from "@lens2/utils/logger";
import { FETCH_CONFIG } from "@lens2/views/shared/constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export interface UseInfiniteFetchParams {
  query: string;
  viewId: string;
  endpoint: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  perPage?: number;
  enabled?: boolean;
  paginationType?: PaginationType; // New parameter, defaults to "cursor"
}

interface CursorFetchFnParams {
  pageParam: string | null;
  endpoint: string;
  headers?: Record<string, string>;
  body: Record<string, any>;
}

interface OffsetFetchFnParams {
  pageParam: number | null;
  endpoint: string;
  headers?: Record<string, string>;
  body: Record<string, any>;
}

type FetchFnParams = CursorFetchFnParams | OffsetFetchFnParams;

// Helper functions for cursor pagination
const getCursorNextPageParam = (
  lastPage: PaginatedResponse<CursorMeta>
): string | null => {
  return lastPage?.meta?.next_cursor || null;
};

const getCursorPrevPageParam = (
  firstPage: PaginatedResponse<CursorMeta>
): string | null => {
  return firstPage?.meta?.prev_cursor || null;
};

// Helper functions for offset pagination
const getOffsetNextPageParam = (
  lastPage: PaginatedResponse<OffsetMeta>
): number | null => {
  const meta = lastPage?.meta;
  if (!meta) return null;
  // Use has_more to determine if there's a next page
  if (meta.has_more) {
    return meta.current_page + 1;
  }
  return null;
};

const getOffsetPrevPageParam = (
  firstPage: PaginatedResponse<OffsetMeta>
): number | null => {
  const meta = firstPage?.meta;
  if (!meta) return null;
  // Can go back if current_page > 1
  if (meta.current_page > 1) {
    return meta.current_page - 1;
  }
  return null;
};

// Create cursor-based fetch function
const createCursorFetchFn = (
  addApiCall: (
    call: Omit<
      import("@lens2/contexts/lens-view-debug-context").ApiCall,
      "id" | "timestamp" | "type"
    >
  ) => string,
  updateApiCall: (
    id: string,
    updates: Partial<import("@lens2/contexts/lens-view-debug-context").ApiCall>
  ) => void
) => {
  return async ({
    pageParam,
    endpoint,
    headers,
    body,
  }: CursorFetchFnParams): Promise<PaginatedResponse<CursorMeta>> => {
    const { perPage, ...restBody } = body;
    const requestBody = {
      ...restBody,
      pagination: {
        type: "cursor",
        per_page: perPage || FETCH_CONFIG.DEFAULT_PER_PAGE,
        cursor: pageParam,
      },
    };

    const startTime = Date.now();

    // Add initial call
    const callId = addApiCall({
      method: "POST",
      endpoint,
      request: requestBody,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        ...headers,
      },
      body: JSON.stringify(requestBody),
    });

    const responseJson = await response.json();

    // Update call with response
    updateApiCall(callId, {
      response: responseJson,
      status: response.status,
      duration: Date.now() - startTime,
    });

    if (!response.ok) {
      logger.error(`Error: ${response.status} - ${endpoint}`);
      return { data: [] };
    }

    if (responseJson?.data && !Array.isArray(responseJson.data)) {
      throw new Error("Expected data to be an array");
    }

    return responseJson;
  };
};

// Create offset-based fetch function
const createOffsetFetchFn = (
  addApiCall: (
    call: Omit<
      import("@lens2/contexts/lens-view-debug-context").ApiCall,
      "id" | "timestamp" | "type"
    >
  ) => string,
  updateApiCall: (
    id: string,
    updates: Partial<import("@lens2/contexts/lens-view-debug-context").ApiCall>
  ) => void
) => {
  return async ({
    pageParam,
    endpoint,
    headers,
    body,
  }: OffsetFetchFnParams): Promise<PaginatedResponse<OffsetMeta>> => {
    const { perPage, ...restBody } = body;
    const requestBody = {
      ...restBody,
      pagination: {
        type: "offset",
        page: pageParam || 1, // Default to page 1
        per_page: perPage || FETCH_CONFIG.DEFAULT_PER_PAGE,
      },
    };

    const startTime = Date.now();

    // Add initial call
    const callId = addApiCall({
      method: "POST",
      endpoint,
      request: requestBody,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        ...headers,
      },
      body: JSON.stringify(requestBody),
    });

    const responseJson = await response.json();

    // Update call with response
    updateApiCall(callId, {
      response: responseJson,
      status: response.status,
      duration: Date.now() - startTime,
    });

    if (!response.ok) {
      logger.error(`Error: ${response.status} - ${endpoint}`);
      return {
        data: [],
        meta: {
          count: 0,
          per_page: perPage || FETCH_CONFIG.DEFAULT_PER_PAGE,
          current_page: 1,
          total_pages: 0,
          has_more: false,
        },
      };
    }

    if (responseJson?.data && !Array.isArray(responseJson.data)) {
      throw new Error("Expected data to be an array");
    }

    return responseJson;
  };
};

export const useInfiniteFetch = ({
  query,
  viewId,
  endpoint,
  headers,
  body = {},
  perPage = FETCH_CONFIG.DEFAULT_PER_PAGE,
  enabled = true,
  paginationType = "cursor", // Default to cursor for backward compatibility
}: UseInfiniteFetchParams) => {
  const { addApiCall, updateApiCall } = useLensViewDebugClient();
  const { setRecordsLoaded } = useLensViewContext();

  // Build the request body - perPage goes into the body
  const requestBody = {
    ...body,
    perPage,
  };

  // Create the appropriate fetch functions
  const cursorFetchFn = useMemo(
    () => createCursorFetchFn(addApiCall, updateApiCall),
    [addApiCall, updateApiCall]
  );

  const offsetFetchFn = useMemo(
    () => createOffsetFetchFn(addApiCall, updateApiCall),
    [addApiCall, updateApiCall]
  );

  // Create a stable query key by stringifying the body to ensure
  // consistent caching even when object references change
  const stableQueryKey = useMemo(() => {
    return [
      "lens",
      query,
      "data",
      viewId,
      paginationType,
      JSON.stringify(body),
    ];
  }, [query, viewId, paginationType, body]);

  // Determine initial page param based on pagination type
  const initialPageParam = paginationType === "offset" ? 1 : null;

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isError,
    error,
    refetch,
    ...rest
  } = useInfiniteQuery({
    queryKey: stableQueryKey,
    queryFn: ({ pageParam }) => {
      if (paginationType === "offset") {
        return offsetFetchFn({
          pageParam: pageParam as number | null,
          endpoint,
          headers,
          body: requestBody,
        });
      } else {
        return cursorFetchFn({
          pageParam: pageParam as string | null,
          endpoint,
          headers,
          body: requestBody,
        });
      }
    },
    initialPageParam,
    getNextPageParam: (lastPage: PaginatedResponse) => {
      if (paginationType === "offset") {
        return getOffsetNextPageParam(
          lastPage as PaginatedResponse<OffsetMeta>
        );
      } else {
        return getCursorNextPageParam(
          lastPage as PaginatedResponse<CursorMeta>
        );
      }
    },
    getPreviousPageParam: (firstPage: PaginatedResponse) => {
      if (paginationType === "offset") {
        return getOffsetPrevPageParam(
          firstPage as PaginatedResponse<OffsetMeta>
        );
      } else {
        return getCursorPrevPageParam(
          firstPage as PaginatedResponse<CursorMeta>
        );
      }
    },
    refetchOnWindowFocus: REFETCH_OPTIONS.ON_WINDOW_FOCUS,
    refetchOnMount: REFETCH_OPTIONS.ON_MOUNT, // Don't refetch when component mounts if we have data
    staleTime: STALE_TIME.INFINITE_DATA, // Never consider data stale
    // gcTime will be inherited from QueryClient's defaultOptions
    placeholderData: previousData => previousData,
    enabled,
  });

  // Flatten all pages data into a single array
  const flatData = useMemo(
    () => data?.pages?.flatMap((page: PaginatedResponse) => page.data) ?? [],
    [data]
  );

  // Get total count if available in meta (works for both pagination types)
  const totalCount = useMemo(() => {
    const firstPageMeta = data?.pages?.[0]?.meta;
    if (!firstPageMeta) return null;

    if (paginationType === "offset") {
      // For offset pagination, 'count' is the total number of records
      return (firstPageMeta as OffsetMeta).count || null;
    } else {
      // For cursor pagination, check both 'total' and 'count'
      const cursorMeta = firstPageMeta as CursorMeta;
      return cursorMeta.total || cursorMeta.count || null;
    }
  }, [data, paginationType]);

  // Get current page and total pages for offset pagination
  const currentPage = useMemo(() => {
    if (paginationType !== "offset" || !data?.pages?.length) return undefined;
    const lastPageMeta = data.pages[data.pages.length - 1]?.meta as OffsetMeta;
    return lastPageMeta?.current_page;
  }, [data, paginationType]);

  const totalPages = useMemo(() => {
    if (paginationType !== "offset" || !data?.pages?.length) return undefined;
    const lastPageMeta = data.pages[data.pages.length - 1]?.meta as OffsetMeta;
    return lastPageMeta?.total_pages;
  }, [data, paginationType]);

  // Update records loaded whenever flatData changes
  useEffect(() => {
    setRecordsLoaded(flatData.length);
  }, [flatData.length, setRecordsLoaded]);

  return {
    // Data
    data,
    flatData,
    totalCount,

    // Pagination actions
    fetchNextPage,
    fetchPreviousPage,

    // Pagination states
    hasNextPage,
    hasPreviousPage,

    // Loading states
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,

    // Error handling
    isError,
    error,

    // Refetch
    refetch,

    // Pagination type and info
    paginationType,
    currentPage,
    totalPages,

    // Rest of the query result
    ...rest,
  };
};

// Export types for consumers
export type UseInfiniteFetchResult = ReturnType<typeof useInfiniteFetch>;
export type { FetchFnParams };
