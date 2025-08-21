import { useLensContext } from "@lens2/contexts/lens-context";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";
import type { Condition, FilterGroup } from "@lens2/types/filters";
import * as logger from "@lens2/utils/logger";
import { FETCH_CONFIG } from "@lens2/views/shared/constants";
import { useMemo } from "react";

interface UseAggregateOptionsParams {
  attribute: string;
  searchQuery?: string;
  dependentFilters?: FilterGroup;
  enabled?: boolean;
}

export const useAggregateOptions = ({
  attribute,
  searchQuery,
  dependentFilters,
  enabled = true,
}: UseAggregateOptionsParams) => {
  const { baseUrl, headers, globalContext, query, attributes } =
    useLensContext();

  // Build endpoint
  const endpoint = `${baseUrl}/${query}/_aggregate`;

  // Build request body
  const body = useMemo(() => {
    const baseBody: Record<string, unknown> = {
      globalContext: globalContext || {},
      options: attribute,
    };

    // Build filters
    const filters: FilterGroup = { op: "and", conditions: [] };

    // Add search filter if user has entered a search query
    if (searchQuery && searchQuery.trim() !== "") {
      const searchCondition: Condition = {
        attribute: attribute,
        op: "contains",
        value: searchQuery.trim(),
      };
      filters.conditions.push(searchCondition);
    }

    // Add dependent filters if they exist
    if (
      dependentFilters &&
      dependentFilters.conditions &&
      dependentFilters.conditions.length > 0
    ) {
      // Merge with existing filters
      if (filters.conditions.length > 0) {
        // Combine both filter sets
        filters.conditions.push(dependentFilters);
      } else {
        // Use dependent filters directly
        baseBody.filters = dependentFilters;
      }
    }

    // Only add filters if there are conditions
    if (filters.conditions.length > 0) {
      baseBody.filters = filters;
    }

    return baseBody;
  }, [searchQuery, globalContext, attribute, dependentFilters]);

  // Use the existing useInfiniteFetch hook
  const result = useInfiniteFetch({
    query: query, // Use the current query name
    viewId: `aggregate-${attribute}`, // Virtual view ID for caching
    endpoint,
    headers,
    body,
    perPage: FETCH_CONFIG.DEFAULT_PER_PAGE,
    enabled,
  });

  // Transform the data to match expected format
  const options = useMemo(() => {
    // Get the aggregator keys from attribute config
    const attributeConfig = attributes[attribute];
    const keys = attributeConfig?.aggregatorKeys;

    if (!keys) {
      logger.error(`Missing aggregatorKeys for attribute: ${attribute}`);
      return [];
    }

    return result.flatData.map((item: Record<string, unknown>) => {
      const value = item[keys.valueKey] as string;
      const label = item[keys.labelKey] as string;
      const count = (item[keys.countKey] as number) || 0;

      return {
        value: value || "",
        label: label || "",
        count: count,
      };
    });
  }, [result.flatData, attribute, attributes]);

  return {
    ...result,
    options,
    data: result.flatData, // Keep original data format
  };
};

// Export type for consumers
export type UseAggregateOptionsResult = ReturnType<typeof useAggregateOptions>;
