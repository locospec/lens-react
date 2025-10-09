import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { useDebounce } from "@lens2/hooks/use-debounce";
import { useFetchMoreOnScroll } from "@lens2/hooks/use-fetch-more-on-scroll";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";
import { useCallback, useMemo, useRef, useState } from "react";

export interface Option {
  value: string;
  label: string;
}

export interface UseOptionParams {
  relatedModelName: string;
  valueField?: string;
  labelField?: string;
  searchQuery?: string;
  perPage?: number;
  enabled?: boolean;
  prefilledValue?: string | string[]; // Value that was prefilled and needs to be fetched
  dependencies?: Record<string, any>; // Dependency map for filtering options
}

export function useOption({
  relatedModelName,
  valueField = "uuid",
  labelField = "name",
  searchQuery = "",
  perPage = 20,
  enabled = true,
  prefilledValue,
  dependencies,
}: UseOptionParams) {
  const { baseUrl, headers, mutator, formData } = useLensFormContext();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localPrefilledValue, setLocalPrefilledValue] =
    useState(prefilledValue);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Create a stable viewId that updates when relatedModelName changes
  const viewId = useMemo(
    () => `fetch-options-${relatedModelName}`,
    [relatedModelName]
  );

  // Build request body following the same pattern as use-aggregate-options
  const requestBody = useMemo(() => {
    const baseBody: Record<string, unknown> = {
      globalContext: {}, // Empty global context for forms
      options: relatedModelName,
      disableTransform: ["*"],
    };

    // Build filters for search
    const filters: any = { op: "and", conditions: [] };

    // Add search filter if user has entered a search query
    if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") {
      const searchCondition = {
        attribute: labelField, // Search on the label field
        op: "contains",
        value: debouncedSearchQuery.trim(),
      };
      filters.conditions.push(searchCondition);
    }

    // Add filter for prefilled value if it exists
    if (localPrefilledValue) {
      const prefilledValues = Array.isArray(localPrefilledValue)
        ? localPrefilledValue
        : [localPrefilledValue];
      const prefilledCondition = {
        attribute: valueField, // Filter on the value field
        op: "is_any_of",
        value: prefilledValues,
      };
      filters.conditions.push(prefilledCondition);
    }

    // Add dependency filters if dependencies are defined
    // Dependencies is an array of field names that this field depends on
    if (dependencies && Array.isArray(dependencies) && formData) {
      dependencies.forEach(dependencyField => {
        const dependencyValue = formData[dependencyField];
        if (
          dependencyValue !== null &&
          dependencyValue !== undefined &&
          dependencyValue !== ""
        ) {
          const dependencyCondition = {
            attribute: dependencyField, // Use the field name directly as the attribute
            op: "is_any_of",
            value: Array.isArray(dependencyValue)
              ? dependencyValue
              : [dependencyValue],
          };
          filters.conditions.push(dependencyCondition);
        }
      });
    }

    // Only add filters if there are conditions
    if (filters.conditions.length > 0) {
      baseBody.filters = filters;
    }

    return baseBody;
  }, [
    debouncedSearchQuery,
    relatedModelName,
    labelField,
    valueField,
    localPrefilledValue,
    dependencies,
    formData,
  ]);

  // Memoize headers to prevent unnecessary re-renders
  const stableHeaders = useMemo(() => headers, [headers]);

  // Infinite fetch for data
  const {
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    totalCount,
  } = useInfiniteFetch({
    query: mutator,
    viewId: viewId,
    endpoint: `${baseUrl}/${relatedModelName}/_read`,
    headers: stableHeaders,
    paginationType: "cursor",
    body: requestBody,
    perPage: perPage,
    enabled: enabled && !!relatedModelName,
    type: "form",
  });

  // Transform data to options format (following aggregate response structure)
  const options = useMemo(() => {
    if (!flatData || !Array.isArray(flatData)) {
      return [];
    }

    return flatData.map((item: any) => {
      // Try to get value and label from the item
      const value = item[valueField] ?? item.id ?? item.value ?? item.key;
      const label =
        item[labelField] ?? item.name ?? item.label ?? item.display ?? value;

      return {
        value: value,
        label: label,
        ...item, // Include all the original item data for prefill
      };
    });
  }, [flatData, valueField, labelField]);

  // No client-side filtering - search is handled by API
  const filteredOptions = options;

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setLocalSearchQuery(query);
  }, []);

  // Handle option selection
  const handleSelect = useCallback(
    (value: string, onValueChange?: (value: string | string[]) => void) => {
      if (onValueChange) {
        onValueChange(value);
      }
    },
    []
  );

  // Create ref for scroll container
  const listRef = useRef<HTMLDivElement | null>(null);

  // Handle scroll pagination
  const { fetchMoreOnBottomReached } = useFetchMoreOnScroll({
    containerRef: listRef,
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  // Handle scroll events
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      fetchMoreOnBottomReached(event.currentTarget);
    },
    [fetchMoreOnBottomReached]
  );

  // Refetch function to reload options for prefilled values
  const refetch = useCallback(
    (valueToFetch?: string | string[]) => {
      console.log(
        "Refetching options for:",
        relatedModelName,
        "with value:",
        valueToFetch
      );

      if (valueToFetch) {
        // Set the prefilled value to trigger a refetch with the specific value filter
        console.log("Fetching specific value:", valueToFetch);
        setLocalPrefilledValue(valueToFetch);
      } else {
        // General refetch - clear search and prefilled value
        setLocalSearchQuery("");
        setLocalPrefilledValue(undefined);
      }
    },
    [relatedModelName]
  );

  return {
    // Data
    options: filteredOptions,
    allOptions: options,

    // Search
    searchQuery: localSearchQuery,
    onSearchChange: handleSearchChange,

    // Selection
    onSelect: handleSelect,

    // Loading states
    isLoading,
    isFetching,
    isFetchingNextPage,

    // Pagination
    hasNextPage,
    fetchNextPage,
    totalCount,

    // Scroll handling
    listRef,
    onScroll: handleScroll,

    // Refetch
    refetch,

    // Config
    perPage,
  };
}
