import { useLensViewContext } from "@lens2/contexts/lens-view-context";
import { useOptionsCache } from "@lens2/contexts/options-cache-context";
import { useAggregateOptions } from "@lens2/filters/hooks/use-aggregate-options";
import { useSelectedOptionsHydration } from "@lens2/filters/hooks/use-selected-options-hydration";
import { handleOptionSelection } from "@lens2/filters/logic/dynamic-options-selection";
import { mapFilterAttributes } from "@lens2/filters/logic/map-filter-attributes";
import { useDebounce } from "@lens2/hooks/use-debounce";
import { useFetchMoreOnScroll } from "@lens2/hooks/use-fetch-more-on-scroll";
import type { FilterGroup } from "@lens2/types/filters";
import * as logger from "@lens2/utils/logger";
import * as React from "react";

export interface UseOptionsParams {
  attribute: string;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  staticOptions?: Array<{ label: string; value: string; count?: number }>;
  dependentFilters?: FilterGroup; // LEGACY: Manual filter constraints (rarely used)
  currentFilters?: FilterGroup; // NEW: Current app filter state (for auto parentFilter)
  uniqueFilters?: boolean;
  onSelectionComplete?: () => void;
}

/**
 * Hook that manages options for filter components
 *
 * Flow:
 * 1. Determines if options are static (predefined) or dynamic (from API aggregator)
 * 2. For dynamic options + uniqueFilters + parentFilter configured:
 *    - Extracts parent filter values from currentFilters
 *    - Builds constraints to only show child options for selected parents
 *    - Example: Only show districts for selected states
 * 3. Handles search with debouncing (backend for dynamic, frontend for static)
 * 4. Manages loading states, pagination, and option selection
 * 5. Provides cascade clearing via useFilterDependencies hook
 */
export function useOptions({
  attribute,
  value,
  onValueChange,
  multiple = false,
  staticOptions,
  dependentFilters,
  currentFilters,
  uniqueFilters = false,
  onSelectionComplete,
}: UseOptionsParams) {
  const [localSearchQuery, setLocalSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const { setOption } = useOptionsCache();
  const { attributes } = useLensViewContext();

  // Normalize value to always be an array for easier handling
  const selectedValues = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Determine if we should use static or dynamic options
  const useStaticOptions = !!staticOptions;
  const [shouldFetchOptions, setShouldFetchOptions] = React.useState(false);

  // Build parent filters for cascading behavior (e.g., state → district → city)
  // Supports multiple parents: city_name can depend on both ["district_name", "state_name"]
  const parentFilters = React.useMemo(() => {
    const attributeConfig = attributes[attribute];
    const parentFiltersConfig = attributeConfig?.parentFilters;

    // Skip parent filtering if:
    // - No parentFilters configured on this attribute
    // - No current filters exist to extract parent values from
    // - uniqueFilters is disabled (feature flag)
    // - This is using static options (parent filtering only for dynamic/aggregated options)
    if (
      !parentFiltersConfig ||
      !currentFilters ||
      !uniqueFilters ||
      useStaticOptions
    ) {
      // No parent filtering needed
      return undefined;
    }

    // parentFiltersConfig is always an array now
    const parentAttributeNames = parentFiltersConfig;

    // Extract currently selected values for ALL parent filters
    // Build separate conditions for each parent
    const parentConditions = [];

    for (const parentAttributeName of parentAttributeNames) {
      const parentValues: string[] = [];

      currentFilters.conditions?.forEach(condition => {
        // Look for conditions that match this parent attribute name
        if (
          "attribute" in condition &&
          condition.attribute === parentAttributeName &&
          condition.value
        ) {
          // Handle both single values and arrays (multi-select)
          if (Array.isArray(condition.value)) {
            parentValues.push(...condition.value.map(String));
          } else {
            parentValues.push(String(condition.value));
          }
        }
      });

      // Only add constraint if this parent has selected values
      if (parentValues.length > 0) {
        parentConditions.push({
          attribute: parentAttributeName,
          op: "is_any_of" as const,
          value: parentValues,
        });
      }
    }

    // If no parent values are selected for any parent, don't constrain child options
    if (parentConditions.length === 0) {
      // No parent constraints needed
      return undefined;
    }

    // Build constraint: "only show options where ALL active parents match selected values"
    // Example: "show cities where district_name is in ['d1','d2'] AND state_name is in ['s1']"
    const parentConstraint: FilterGroup = {
      op: "and" as const,
      conditions: parentConditions,
    };

    // Apply filter attribute mapping to convert to backend field names
    const mappedParentConstraint = mapFilterAttributes(
      parentConstraint,
      attributes
    ) as FilterGroup;

    return mappedParentConstraint; // Auto-generated and mapped parent constraint
  }, [attributes, attribute, currentFilters, uniqueFilters, useStaticOptions]);

  // Trigger fetching when needed (for combobox, this is when dropdown opens)
  const enableFetching = React.useCallback(() => {
    if (!useStaticOptions) {
      setShouldFetchOptions(true);
    }
  }, [useStaticOptions]);

  // Combine parentFilters (auto-generated) with dependentFilters (manual, if any)
  const combinedFilters = React.useMemo(() => {
    if (parentFilters && dependentFilters?.conditions?.length) {
      // Both parent constraints and manual constraints exist
      return {
        op: "and" as const,
        conditions: [parentFilters, dependentFilters],
      };
    }
    // Return whichever exists (parentFilters takes precedence)
    return parentFilters || dependentFilters;
  }, [parentFilters, dependentFilters]);

  // Fetch dynamic options from backend using aggregator API
  // Key points:
  // - Only runs for dynamic options (not static ones)
  // - Uses debounced search query to avoid API spam
  // - Passes combined filters to constrain results (cascading behavior + manual constraints)
  // - Only enabled when shouldFetchOptions is true (lazy loading)
  const aggregateResult = useAggregateOptions({
    attribute,
    searchQuery: debouncedSearchQuery,
    dependentFilters: combinedFilters, // This is where parent + manual constraints are applied
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

  // Filter static options based on local search query (immediate filtering)
  // Note: For static options, we filter on the frontend immediately as user types
  // This is different from dynamic options which are filtered on the backend
  const filteredStaticOptions = React.useMemo(() => {
    if (!staticOptions || !localSearchQuery) return staticOptions || [];
    return staticOptions.filter(option =>
      option.label.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
  }, [staticOptions, localSearchQuery]);

  // Determine final options and loading states based on static vs dynamic
  const options = useStaticOptions
    ? filteredStaticOptions // Static: use client-side filtered options
    : aggregateResult.options; // Dynamic: use backend results (with parent constraints)
  const isLoading = useStaticOptions ? false : aggregateResult.isLoading;
  const isFetching = useStaticOptions ? false : aggregateResult.isFetching;
  const hasNextPage = useStaticOptions ? false : aggregateResult.hasNextPage;
  const fetchNextPage = useStaticOptions
    ? () => {} // No pagination for static options
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
      logger.info("Dynamic option selected", { optionValue });

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
    searchQuery: localSearchQuery,
    setSearchQuery: setLocalSearchQuery,
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
