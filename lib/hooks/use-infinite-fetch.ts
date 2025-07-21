import { useLensContext } from "@lens2/contexts/lens-context";
import { useLensDebugClient } from "@lens2/contexts/lens-debug-context";
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
}

interface FetchFnParams {
  pageParam: string | null;
  endpoint: string;
  headers?: Record<string, string>;
  body: Record<string, any>;
}

interface PaginatedResponse {
  data: any[];
  meta?: {
    next_cursor?: string | null;
    prev_cursor?: string | null;
    has_more?: boolean;
    count?: number;
    per_page?: number;
    total?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

const createFetchFn = (
  addApiCall: (call: any) => string,
  updateApiCall: (id: string, updates: any) => void
) => {
  return async ({
    pageParam,
    endpoint,
    headers,
    body,
  }: FetchFnParams): Promise<PaginatedResponse> => {
    const { perPage, ...restBody } = body;
    const requestBody = {
      ...restBody,
      pagination: {
        type: "cursor",
        per_page: perPage || 10,
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
      console.error(`Error: ${response.status} - ${endpoint}`);
      return { data: [] };
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
  perPage = 10,
  enabled = true,
}: UseInfiniteFetchParams) => {
  const { addApiCall, updateApiCall } = useLensDebugClient();
  const { setRecordsLoaded } = useLensContext();

  // Build the request body - perPage goes into the body
  const requestBody = {
    ...body,
    perPage,
  };

  // Create the fetch function with API tracking
  const fetchFn = useMemo(
    () => createFetchFn(addApiCall, updateApiCall),
    [addApiCall, updateApiCall]
  );

  // Create a stable query key by stringifying the body to ensure
  // consistent caching even when object references change
  const stableQueryKey = useMemo(() => {
    return ["lens", query, "data", viewId, JSON.stringify(body)];
  }, [query, viewId, body]);

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
    queryFn: ({ pageParam = null }) =>
      fetchFn({
        pageParam: pageParam as string | null,
        endpoint,
        headers,
        body: requestBody,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PaginatedResponse) => {
      return lastPage?.meta?.next_cursor || null;
    },
    getPreviousPageParam: (firstPage: PaginatedResponse) =>
      firstPage?.meta?.prev_cursor || null,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch when component mounts if we have data
    staleTime: Infinity, // Never consider data stale
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (v5 uses gcTime instead of cacheTime)
    placeholderData: previousData => previousData,
    enabled,
  });

  // Flatten all pages data into a single array
  const flatData = useMemo(
    () => data?.pages?.flatMap((page: PaginatedResponse) => page.data) ?? [],
    [data]
  );

  // Get total count if available in meta (check both 'total' and 'count')
  const totalCount = useMemo(
    () =>
      data?.pages?.[0]?.meta?.total || data?.pages?.[0]?.meta?.count || null,
    [data]
  );

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

    // Rest of the query result
    ...rest,
  };
};

// Export types for consumers
export type UseInfiniteFetchResult = ReturnType<typeof useInfiniteFetch>;
export type { FetchFnParams, PaginatedResponse };
