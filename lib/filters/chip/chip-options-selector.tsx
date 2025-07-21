import { DynamicOptionsSelector } from "@lens2/filters/components/ui/dynamic-options-selector";
import { useDynamicOptions } from "@lens2/filters/hooks/use-dynamic-options";
import { getDisplayText } from "@lens2/filters/logic/dynamic-options-selection";
import { Button } from "@lens2/shadcn/components/ui/button";
import { CommandItem } from "@lens2/shadcn/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lens2/shadcn/components/ui/tooltip";
import { cn } from "@lens2/shadcn/lib/utils";
import { Check } from "lucide-react";
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
  } = useDynamicOptions({
    attribute,
    value,
    onValueChange,
    multiple,
    staticOptions,
  });

  // Enable fetching immediately for chip filters (no dropdown to open)
  React.useEffect(() => {
    enableFetching();
  }, [enableFetching]);

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

  // For static options without search, show a simple list
  if (useStaticOptions && !searchQuery) {
    return (
      <div className={cn("space-y-1", className)}>
        {options.map(option => (
          <CommandItem
            key={option.value}
            value={option.value}
            onSelect={() => handleSelect(option.value)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedValues.includes(option.value)
                  ? "opacity-100"
                  : "opacity-0"
              )}
            />
            {option.label}
            {option.count !== undefined && (
              <span className="text-muted-foreground ml-auto text-xs">
                {option.count}
              </span>
            )}
          </CommandItem>
        ))}
      </div>
    );
  }

  // For dynamic options or when searching, use the full selector
  return (
    <DynamicOptionsSelector
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
