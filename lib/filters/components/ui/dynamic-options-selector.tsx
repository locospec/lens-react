import { DynamicOptionsList } from "@lens2/filters/components/ui/dynamic-options-list";
import {
  Command,
  CommandInput,
  CommandList,
} from "@lens2/shadcn/components/ui/command";
import type { RefObject } from "react";

export interface DynamicOption {
  value: string;
  label: string;
  count?: number;
}

export interface DynamicOptionsSelectorProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Options
  options: DynamicOption[];
  selectedValues: string[];
  hydratedOptions: Map<string, string>;

  // Selection
  onSelect: (value: string) => void;
  multiple?: boolean;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;

  // Scroll handling
  listRef?: RefObject<HTMLDivElement | null>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;

  // UI
  emptyText?: string;
  className?: string;
}

export function DynamicOptionsSelector({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  options,
  selectedValues,
  hydratedOptions,
  onSelect,
  multiple = false,
  isLoading,
  isFetching,
  hasNextPage,
  listRef,
  onScroll,
  emptyText = "No options found.",
  className = "w-full",
}: DynamicOptionsSelectorProps) {
  return (
    <Command shouldFilter={false} className={className}>
      <CommandInput
        placeholder={searchPlaceholder}
        value={searchQuery}
        onValueChange={onSearchChange}
      />
      <CommandList
        ref={listRef}
        onScroll={onScroll}
        className="max-h-[300px] overflow-y-auto"
      >
        <DynamicOptionsList
          options={options}
          selectedValues={selectedValues}
          hydratedOptions={hydratedOptions}
          multiple={multiple}
          isLoading={isLoading}
          isFetching={isFetching}
          hasNextPage={hasNextPage}
          emptyText={emptyText}
          onSelect={onSelect}
        />
      </CommandList>
    </Command>
  );
}
