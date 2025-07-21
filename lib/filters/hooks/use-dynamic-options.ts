import { useOptionsCache } from "@lens2/contexts/options-cache-context";
import { useAggregateOptions } from "@lens2/filters/hooks/use-aggregate-options";
import { useSelectedOptionsHydration } from "@lens2/filters/hooks/use-selected-options-hydration";
import { handleOptionSelection } from "@lens2/filters/logic/dynamic-options-selection";
import { useFetchMoreOnScroll } from "@lens2/hooks/use-fetch-more-on-scroll";
import type { FilterGroup } from "@lens2/types/filters";
import * as React from "react";

export interface UseDynamicOptionsParams {
  attribute: string;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  staticOptions?: Array<{ label: string; value: string; count?: number }>;
  dependentFilters?: FilterGroup;
  onSelectionComplete?: () => void;
}

export function useDynamicOptions({
  attribute,
  value,
  onValueChange,
  multiple = false,
  staticOptions,
  dependentFilters,
  onSelectionComplete,
}: UseDynamicOptionsParams) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const { setOption } = useOptionsCache();

  // Normalize value to always be an array for easier handling
  const selectedValues = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Determine if we should use static or dynamic options
  const useStaticOptions = !!staticOptions;
  const [shouldFetchOptions, setShouldFetchOptions] = React.useState(false);

  // Trigger fetching when needed (for combobox, this is when dropdown opens)
  const enableFetching = React.useCallback(() => {
    if (!useStaticOptions) {
      setShouldFetchOptions(true);
    }
  }, [useStaticOptions]);

  // Use aggregate options hook only if we don't have static options
  const aggregateResult = useAggregateOptions({
    attribute,
    searchQuery,
    dependentFilters,
    enabled: !useStaticOptions && shouldFetchOptions,
  });

  // Determine which selected values need hydration
  const selectedIdsNeedingHydration = React.useMemo(() => {
    if (!selectedValues.length || useStaticOptions) return [];
    return selectedValues;
  }, [selectedValues, useStaticOptions]);

  // Hydrate missing labels
  const { hydratedOptions, isHydrating } = useSelectedOptionsHydration({
    attribute,
    selectedIds: selectedIdsNeedingHydration,
  });

  // Filter static options based on search query
  const filteredStaticOptions = React.useMemo(() => {
    if (!staticOptions || !searchQuery) return staticOptions || [];
    return staticOptions.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staticOptions, searchQuery]);

  // Final options to display
  const options = useStaticOptions
    ? filteredStaticOptions
    : aggregateResult.options;
  const isLoading = useStaticOptions ? false : aggregateResult.isLoading;
  const isFetching = useStaticOptions ? false : aggregateResult.isFetching;
  const hasNextPage = useStaticOptions ? false : aggregateResult.hasNextPage;
  const fetchNextPage = useStaticOptions
    ? () => {}
    : aggregateResult.fetchNextPage;

  // Handle infinite scroll
  const { fetchMoreOnBottomReached } = useFetchMoreOnScroll({
    containerRef: listRef,
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      fetchMoreOnBottomReached(event.currentTarget);
    },
    [fetchMoreOnBottomReached]
  );

  // Handle option selection
  const handleSelect = React.useCallback(
    (optionValue: string) => {
      handleOptionSelection({
        optionValue,
        options,
        selectedValues,
        multiple,
        attribute,
        onValueChange,
        setOption,
        onComplete: onSelectionComplete,
      });
    },
    [
      options,
      selectedValues,
      multiple,
      attribute,
      onValueChange,
      setOption,
      onSelectionComplete,
    ]
  );

  return {
    // State
    searchQuery,
    setSearchQuery,
    selectedValues,
    options,
    hydratedOptions,

    // Loading states
    isLoading,
    isFetching,
    isHydrating,
    hasNextPage,

    // Refs
    listRef,

    // Handlers
    handleScroll,
    handleSelect,
    enableFetching,

    // Utilities
    useStaticOptions,
    filteredStaticOptions,
  };
}
