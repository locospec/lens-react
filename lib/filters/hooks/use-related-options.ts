import { useLensContext } from "@lens2/contexts/lens-context";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";
import type { FilterGroup } from "@lens2/types/filters";
import { useMemo } from "react";

interface UseRelatedOptionsParams {
  attribute: string;
  relatedModelName: string;
  dependentFilters: FilterGroup;
  searchQuery?: string;
}

export const useRelatedOptions = ({
  attribute,
  relatedModelName,
  dependentFilters,
  searchQuery,
}: UseRelatedOptionsParams) => {
  const { baseUrl, headers, globalContext, query } = useLensContext();

  // Build endpoint
  const endpoint = `${baseUrl}/_read_related_options`;

  // Build request body
  const body = useMemo(
    () => ({
      search: searchQuery || "",
      globalContext: globalContext || {},
      relation: relatedModelName,
      filters: dependentFilters,
    }),
    [searchQuery, globalContext, relatedModelName, dependentFilters]
  );

  // Use the existing useInfiniteFetch hook
  const result = useInfiniteFetch({
    query: query, // Use the current query name
    viewId: `related-${attribute}`, // Virtual view ID for caching
    endpoint,
    headers,
    body,
    perPage: 10,
  });

  // Transform the data to match expected format
  const options = useMemo(() => {
    return result.flatData.map((item: { const: string; title: string }) => ({
      value: item.const,
      label: item.title,
    }));
  }, [result.flatData]);

  return {
    ...result,
    options,
    data: result.flatData, // Keep original data format
  };
};

// Export type for consumers
export type UseRelatedOptionsResult = ReturnType<typeof useRelatedOptions>;
