"use client";

import { ChevronsUpDownIcon, Loader2 } from "lucide-react";
import * as React from "react";

import { OptionsSelector } from "@lens2/filters/components/ui/options-selector";
import { useOptions } from "@lens2/filters/hooks/use-options";
import { getDisplayText } from "@lens2/filters/logic/dynamic-options-selection";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lens2/shadcn/components/ui/tooltip";
import { cn } from "@lens2/shadcn/lib/utils";
import type { FilterGroup } from "@lens2/types/filters";

export interface OptionsComboboxProps {
  attribute: string;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  dependentFilters?: FilterGroup;
  multiple?: boolean;
  staticOptions?: Array<{ label: string; value: string; count?: number }>; // For static options
}

export function OptionsCombobox({
  attribute,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  dependentFilters,
  multiple = false,
  staticOptions,
}: OptionsComboboxProps) {
  const [open, setOpen] = React.useState(false);

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
    handleSelect: baseHandleSelect,
    enableFetching,
  } = useOptions({
    attribute,
    value,
    onValueChange,
    multiple,
    staticOptions,
    dependentFilters,
    onSelectionComplete: () => setOpen(false),
  });

  // Trigger fetching when dropdown opens
  React.useEffect(() => {
    if (open) {
      enableFetching();
    }
  }, [open, enableFetching]);

  // Get display text for button
  const displayInfo = React.useMemo(
    () =>
      getDisplayText(
        selectedValues,
        options,
        hydratedOptions,
        isHydrating,
        placeholder,
        multiple
      ),
    [
      selectedValues,
      options,
      hydratedOptions,
      isHydrating,
      placeholder,
      multiple,
    ]
  );

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {displayInfo.isTruncated ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn("justify-between", className)}
                  disabled={disabled}
                >
                  <span className="flex-1 truncate text-left">
                    {displayInfo.text}
                  </span>
                  {displayInfo.isLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-words">{displayInfo.fullText}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("justify-between", className)}
              disabled={disabled}
            >
              <span className="flex-1 truncate text-left">
                {displayInfo.text}
              </span>
              {displayInfo.isLoading ? (
                <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <OptionsSelector
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
            options={options}
            selectedValues={selectedValues}
            hydratedOptions={hydratedOptions}
            onSelect={baseHandleSelect}
            multiple={multiple}
            isLoading={isLoading}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            listRef={listRef}
            onScroll={handleScroll}
            emptyText={emptyText}
          />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
