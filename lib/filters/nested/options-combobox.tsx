"use client";

import { ChevronsUpDownIcon, Loader2 } from "lucide-react";
import * as React from "react";

import {
  renderDisplayText,
  renderOptionsSelector,
  useBaseOptionsSelector,
  type BaseOptionsSelectorProps,
} from "@lens2/filters/components/ui/base-options-selector";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";

export interface OptionsComboboxProps extends BaseOptionsSelectorProps {
  placeholder?: string;
  disabled?: boolean;
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
  currentFilters,
  uniqueFilters,
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
    displayInfo,
    isLoading,
    isFetching,
    hasNextPage,
    listRef,
    handleScroll,
    handleSelect,
    enableFetching,
  } = useBaseOptionsSelector({
    attribute,
    value,
    onValueChange,
    multiple,
    staticOptions,
    dependentFilters,
    currentFilters,
    uniqueFilters,
    onSelectionComplete: () => setOpen(false),
    displayConfig: {
      placeholder,
      showLoading: true,
    },
  });

  // Trigger fetching when dropdown opens
  React.useEffect(() => {
    if (open) {
      enableFetching();
    }
  }, [open, enableFetching]);

  const buttonContent = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn("justify-between", className)}
      disabled={disabled}
    >
      <span className="flex-1 truncate text-left">{displayInfo.text}</span>
      {displayInfo.isLoading ? (
        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
      ) : (
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      )}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderDisplayText(displayInfo, buttonContent)}
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {renderOptionsSelector({
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
          searchPlaceholder,
          emptyText,
          multiple,
        })}
      </PopoverContent>
    </Popover>
  );
}
