import { ChipOptionsSelector } from "@lens2/filters/chip/chip-options-selector";
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
}: ChipValueInputProps) {
  const options = attribute.options || [];
  const optionsAggregator = attribute?.optionsAggregator;

  // Determine if multiple selection based on operator
  const isMultiple = operator === "is_any_of" || operator === "is_none_of";

  // Handle click to enter edit mode
  const handleClick = () => {
    if (!isEditing && onEditingChange) {
      onEditingChange(true);
    }
  };

  // Case 1: Use ChipOptionsSelector for dynamic selection (aggregator-based)
  if (optionsAggregator) {
    return (
      <ChipOptionsSelector
        attribute={attribute.name}
        value={value as string | string[]}
        onValueChange={onChange}
        multiple={isMultiple}
        searchPlaceholder={`Search ${attribute.label.toLowerCase()}...`}
        emptyText={`No ${attribute.label.toLowerCase()} found.`}
        className={className}
        isEditing={isEditing}
        onEditingChange={onEditingChange}
      />
    );
  }

  // Case 2: Use ChipOptionsSelector for static options
  if (options.length > 0) {
    return (
      <ChipOptionsSelector
        attribute={attribute.name}
        value={value as string | string[]}
        onValueChange={onChange}
        multiple={isMultiple}
        staticOptions={options}
        searchPlaceholder={`Search ${attribute.label.toLowerCase()}...`}
        emptyText={`No ${attribute.label.toLowerCase()} found.`}
        className={className}
        isEditing={isEditing}
        onEditingChange={onEditingChange}
      />
    );
  }

  // Case 3: For attributes without options, use a simple input
  if (!isEditing) {
    // Display mode for simple values
    const displayValue = (() => {
      if (value === null || value === undefined) return "empty";
      if (typeof value === "boolean") return value ? "true" : "false";
      if (value instanceof Date) return value.toLocaleDateString();
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "empty";
      }
      return String(value);
    })();

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
