import { OptionsSelector } from "@lens2/filters/components/ui/options-selector";
import { useOptions } from "@lens2/filters/hooks/use-options";
import { getDisplayText } from "@lens2/filters/logic/dynamic-options-selection";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lens2/shadcn/components/ui/tooltip";
import { cn } from "@lens2/shadcn/lib/utils";
import * as React from "react";

interface ChipOptionsSelectorProps {
  attribute: string;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  staticOptions?: Array<{ label: string; value: string; count?: number }>;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export function ChipOptionsSelector({
  attribute,
  value,
  onValueChange,
  multiple = false,
  staticOptions,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  className,
  isEditing = false,
  onEditingChange,
}: ChipOptionsSelectorProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedValues,
    options,
    hydratedOptions,
    isLoading,
    isFetching,
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
  });

  // Enable fetching immediately for chip filters (no dropdown to open)
  // But only for dynamic options, not static ones
  React.useEffect(() => {
    if (!useStaticOptions) {
      enableFetching();
    }
  }, [enableFetching, useStaticOptions]);

  // Get display text for current value
  const displayInfo = React.useMemo(
    () =>
      getDisplayText(
        selectedValues,
        options,
        hydratedOptions,
        false, // isHydrating - we don't track this in chip filters
        "empty",
        multiple
      ),
    [selectedValues, options, hydratedOptions, multiple]
  );

  // Handle click to enter edit mode
  const handleClick = () => {
    if (!isEditing && onEditingChange) {
      onEditingChange(true);
    }
  };

  // If not editing, show display mode
  if (!isEditing) {
    if (displayInfo.isTruncated) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-auto p-0 px-1", className)}
                onClick={handleClick}
              >
                {displayInfo.text}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">{displayInfo.fullText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-auto p-0 px-1", className)}
        onClick={handleClick}
      >
        {displayInfo.text}
      </Button>
    );
  }

  // Use OptionsSelector for both static and dynamic options
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
      className={className}
    />
  );
}
