import {
  renderDisplayText,
  renderOptionsSelector,
  useBaseOptionsSelector,
  type BaseOptionsSelectorProps,
} from "@lens2/filters/components/ui/base-options-selector";
import { Button } from "@lens2/shadcn/components/ui/button";
import { cn } from "@lens2/shadcn/lib/utils";

interface ChipOptionsSelectorProps extends BaseOptionsSelectorProps {
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
  currentFilters,
  uniqueFilters,
}: ChipOptionsSelectorProps) {
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
  } = useBaseOptionsSelector({
    attribute,
    value,
    onValueChange,
    multiple,
    staticOptions,
    currentFilters,
    uniqueFilters,
    displayConfig: {
      placeholder: "empty",
      enableAutoFetch: true,
    },
  });

  // Handle click to enter edit mode
  const handleClick = () => {
    if (!isEditing && onEditingChange) {
      onEditingChange(true);
    }
  };

  // If not editing, show display mode
  if (!isEditing) {
    const buttonContent = (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-auto p-0 px-1", className)}
        onClick={handleClick}
      >
        {displayInfo.text}
      </Button>
    );

    return renderDisplayText(displayInfo, buttonContent);
  }

  // Use OptionsSelector for both static and dynamic options
  return renderOptionsSelector({
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
  });
}
