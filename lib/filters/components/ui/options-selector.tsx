import { OptionsList } from "@lens2/filters/components/ui/options-list";
import {
  Command,
  CommandInput,
  CommandList,
} from "@lens2/shadcn/components/ui/command";
import type { RefObject } from "react";

export interface Option {
  value: string;
  label: string;
  count?: number;
}

export interface OptionsSelectorProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Options
  options: Option[];
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

export function OptionsSelector({
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
}: OptionsSelectorProps) {
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
        <OptionsList
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
