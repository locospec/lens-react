import { OptionsSelector } from "@lens2/filters/components/ui/options-selector";
import { useOptions } from "@lens2/filters/hooks/use-options";
import { getDisplayText } from "@lens2/filters/logic/dynamic-options-selection";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lens2/shadcn/components/ui/tooltip";
import { cn } from "@lens2/shadcn/lib/utils";
import type { FilterGroup } from "@lens2/types/filters";
import * as React from "react";

/**
 * Base interface for options selector components
 */
export interface BaseOptionsSelectorProps {
  attribute: string;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  staticOptions?: Array<{ label: string; value: string; count?: number }>;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  dependentFilters?: FilterGroup;
  currentFilters?: FilterGroup;
  uniqueFilters?: boolean;
}

/**
 * Display mode configuration for options selector
 */
export interface DisplayModeConfig {
  placeholder?: string;
  showLoading?: boolean;
  enableAutoFetch?: boolean;
}

/**
 * Hook that provides common options selector functionality
 */
export function useBaseOptionsSelector({
  attribute,
  value,
  onValueChange,
  multiple = false,
  staticOptions,
  dependentFilters,
  currentFilters,
  uniqueFilters,
  onSelectionComplete,
  displayConfig = {},
}: BaseOptionsSelectorProps & {
  onSelectionComplete?: () => void;
  displayConfig?: DisplayModeConfig;
}) {
  const {
    searchQuery,
    setSearchQuery,
    selectedValues,
    options,
    hydratedOptions,
    isLoading,
    isFetching,
    isHydrating,
    hasNextPage,
    listRef,
    handleScroll,
    handleSelect,
    useStaticOptions,
    enableFetching,
  } = useOptions({
    attribute,
    value,
    onValueChange,
    multiple,
    staticOptions,
    dependentFilters,
    currentFilters,
    uniqueFilters,
    onSelectionComplete,
  });

  // Note: Cascading filter dependencies now handled by cascade-filter-manager in chip-filter-builder

  // Auto-enable fetching for dynamic options if configured
  React.useEffect(() => {
    if (displayConfig.enableAutoFetch && !useStaticOptions) {
      enableFetching();
    }
  }, [enableFetching, useStaticOptions, displayConfig.enableAutoFetch]);

  // Get display text for current selection
  const displayInfo = React.useMemo(
    () =>
      getDisplayText(
        selectedValues,
        options,
        hydratedOptions,
        displayConfig.showLoading ? isHydrating : false,
        displayConfig.placeholder || "empty",
        multiple
      ),
    [
      selectedValues,
      options,
      hydratedOptions,
      isHydrating,
      displayConfig.placeholder,
      displayConfig.showLoading,
      multiple,
    ]
  );

  return {
    // State
    searchQuery,
    setSearchQuery,
    selectedValues,
    options,
    hydratedOptions,
    displayInfo,

    // Loading states
    isLoading,
    isFetching,
    isHydrating,
    hasNextPage,

    // Handlers
    handleScroll,
    handleSelect,
    enableFetching,

    // Refs
    listRef,

    // Utils
    useStaticOptions,
  };
}

/**
 * Renders the options selector list component
 */
export function renderOptionsSelector({
  searchQuery,
  setSearchQuery,
  options,
  selectedValues,
  hydratedOptions,
  isLoading,
  isFetching,
  hasNextPage,
  listRef,
  handleScroll,
  handleSelect,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  multiple = false,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  options: Array<{ label: string; value: string; count?: number }>;
  selectedValues: string[];
  hydratedOptions: Map<string, string>;
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  handleSelect: (value: string) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  multiple?: boolean;
}) {
  return (
    <OptionsSelector
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={searchPlaceholder}
      options={options}
      selectedValues={selectedValues}
      hydratedOptions={hydratedOptions}
      onSelect={handleSelect}
      multiple={multiple}
      isLoading={isLoading}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      listRef={listRef}
      onScroll={handleScroll}
      emptyText={emptyText}
    />
  );
}

/**
 * Renders display text with optional tooltip for truncation
 */
export function renderDisplayText(
  displayInfo: ReturnType<typeof getDisplayText>,
  children: React.ReactNode,
  className?: string
) {
  if (displayInfo.isTruncated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className={className}>
            {children}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-words">{displayInfo.fullText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <div className={cn(className)}>{children}</div>;
}
