import { ChipOptionsSelector } from "@lens2/filters/chip/chip-options-selector";
import { UnifiedSmartDateInput } from "@lens2/filters/components/unified-smart-date-input";
import {
  operatorExpectsMultiple,
  operatorExpectsRange,
} from "@lens2/filters/logic/filter-operators-config";
import {
  determineInputStrategy,
  formatDisplayValue,
  getEmptyText,
  getSearchPlaceholder,
} from "@lens2/filters/logic/value-input-factory";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Input } from "@lens2/shadcn/components/ui/input";
import { cn } from "@lens2/shadcn/lib/utils";
import { ChipValueInputProps } from "./types";

export function ChipValueInput({
  attribute,
  value,
  onChange,
  operator = attribute.defaultOperator,
  className,
  isEditing = false,
  onEditingChange,
  currentFilters,
  uniqueFilters,
}: ChipValueInputProps) {
  const options = attribute.options || [];
  const optionsAggregator = attribute?.optionsAggregator;

  // Use factory functions for shared logic
  const isMultiple = operatorExpectsMultiple(operator);
  const isRange = operatorExpectsRange(operator);
  const inputStrategy = determineInputStrategy({
    type: attribute.type,
    options,
    optionsAggregator,
  });

  // Handle click to enter edit mode
  const handleClick = () => {
    if (!isEditing && onEditingChange) {
      onEditingChange(true);
    }
  };

  // Case 1: Use ChipOptionsSelector for dynamic selection (aggregator-based)
  if (inputStrategy === "dynamic_options") {
    return (
      <ChipOptionsSelector
        attribute={attribute.name}
        value={value as string | string[]}
        onValueChange={onChange}
        multiple={isMultiple}
        searchPlaceholder={getSearchPlaceholder(attribute.label)}
        emptyText={getEmptyText(attribute.label)}
        className={className}
        isEditing={isEditing}
        onEditingChange={onEditingChange}
        currentFilters={currentFilters}
        uniqueFilters={uniqueFilters}
      />
    );
  }

  // Case 2: Use ChipOptionsSelector for static options
  if (inputStrategy === "static_options") {
    return (
      <ChipOptionsSelector
        attribute={attribute.name}
        value={value as string | string[]}
        onValueChange={onChange}
        multiple={isMultiple}
        staticOptions={options}
        searchPlaceholder={getSearchPlaceholder(attribute.label)}
        emptyText={getEmptyText(attribute.label)}
        className={className}
        isEditing={isEditing}
        onEditingChange={onEditingChange}
        currentFilters={currentFilters}
        uniqueFilters={uniqueFilters}
      />
    );
  }

  // Case 3: Use UnifiedSmartDateInput for date types
  if (inputStrategy === "date_input") {
    return (
      <UnifiedSmartDateInput
        variant="chip"
        value={value as string | [string, string] | null}
        onChange={onChange}
        forceRangeMode={isRange}
        placeholder={`Select ${attribute.label.toLowerCase()}`}
        className={className}
      />
    );
  }

  // Case 4: For attributes without options, use a simple input
  if (!isEditing) {
    // Display mode for simple values - use factory function
    const displayValue = formatDisplayValue(value);

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-auto p-0 px-1", className)}
        onClick={handleClick}
      >
        {displayValue}
      </Button>
    );
  }

  return (
    <Input
      type="text"
      value={value as string}
      onChange={e => onChange(e.target.value)}
      placeholder={`Enter ${attribute.label.toLowerCase()}`}
      className={cn("h-8", className)}
      autoFocus
    />
  );
}
